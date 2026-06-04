using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AuthService.Api.Swagger;

/// <summary>
/// Agrega ejemplos realistas para facilitar el uso de Swagger UI (Try it out).
/// </summary>
public class AuthExamplesOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var path = context.ApiDescription.RelativePath?.Split('?')[0].Trim('/').ToLowerInvariant() ?? string.Empty;
        var method = context.ApiDescription.HttpMethod?.ToUpperInvariant() ?? string.Empty;

        if (method == "POST" && path == "api/auth/login")
        {
            SetJsonRequestExample(operation, new OpenApiObject
            {
                ["email"] = new OpenApiString("adminrestaurante@losrezagados.com"),
                ["password"] = new OpenApiString("CambiarEstaClave#2026")
            });
        }

        if (method == "POST" && path == "api/auth/register")
        {
            SetJsonRequestExample(operation, new OpenApiObject
            {
                ["username"] = new OpenApiString("carlos.rubio"),
                ["email"] = new OpenApiString("carlos.rubio@losrezagados.com"),
                ["password"] = new OpenApiString("MiClaveSegura#2026"),
                ["role"] = new OpenApiString("admin")
            });
        }

        if (method == "POST" && path == "api/auth/verify-email")
        {
            SetParameterExample(operation, "token", "email-verify-token-ejemplo-abc123");
        }

        if (method == "POST" && path == "api/auth/forgot-password")
        {
            SetParameterExample(operation, "email", "carlos.rubio@losrezagados.com");
        }

        if (method == "POST" && path == "api/auth/reset-password")
        {
            SetParameterExample(operation, "token", "reset-token-ejemplo-def456");
            SetParameterExample(operation, "newPassword", "NuevaClaveSegura#2026");
        }
    }

    private static void SetJsonRequestExample(OpenApiOperation operation, OpenApiObject example)
    {
        if (operation.RequestBody?.Content == null)
        {
            return;
        }

        if (operation.RequestBody.Content.TryGetValue("application/json", out var mediaType))
        {
            mediaType.Example = example;
        }
    }

    private static void SetParameterExample(OpenApiOperation operation, string parameterName, string example)
    {
        var parameter = operation.Parameters?.FirstOrDefault(p =>
            string.Equals(p.Name, parameterName, StringComparison.OrdinalIgnoreCase));

        if (parameter != null)
        {
            parameter.Example = new OpenApiString(example);
        }
    }
}

