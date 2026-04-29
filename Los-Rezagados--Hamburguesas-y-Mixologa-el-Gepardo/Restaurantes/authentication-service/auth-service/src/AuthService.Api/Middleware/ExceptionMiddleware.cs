using System.Net;
using System.Text.Json;

namespace AuthService.Api.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message, errorCode) = exception switch
        {
            UnauthorizedAccessException =>
                ((int)HttpStatusCode.Forbidden,
                "No tiene permisos para realizar esta acción",
                "FORBIDDEN"),

            ArgumentException =>
                ((int)HttpStatusCode.BadRequest,
                "Solicitud inválida",
                "INVALID_REQUEST"),

            _ =>
                ((int)HttpStatusCode.InternalServerError,_env.IsDevelopment()
                    ? exception.Message
                    : "Ocurrió un error interno. Contacte al administrador.","INTERNAL_SERVER_ERROR")
        };

        if (statusCode >= 500)
        {
            _logger.LogError(
                exception,
                "Error crítico. TraceId: {TraceId}",
                context.TraceIdentifier);
        }
        else
        {
            _logger.LogWarning(exception.Message);
        }

        context.Response.StatusCode = statusCode;

        var response = new
        {
            success = false,
            message,
            errorCode,
            traceId = context.TraceIdentifier,
            timestamp = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(response, JsonOptions);
        await context.Response.WriteAsync(json);
    }
}