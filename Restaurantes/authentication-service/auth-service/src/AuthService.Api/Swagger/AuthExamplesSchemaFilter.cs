using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AuthService.Api.Swagger;

/// <summary>
/// Define ejemplos por esquema para que Swagger UI precargue JSON realista en Try it out.
/// </summary>
public class AuthExamplesSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        var typeName = context.Type.Name;

        if (typeName == "LoginDto")
        {
            schema.Example = new OpenApiObject
            {
                ["email"] = new OpenApiString("adminrestaurante@losrezagados.com"),
                ["password"] = new OpenApiString("CambiarEstaClave#2026")
            };

            SetPropertyExample(schema, "email", "adminrestaurante@losrezagados.com");
            SetPropertyExample(schema, "password", "CambiarEstaClave#2026");
            return;
        }

        if (typeName == "RegisterDto")
        {
            schema.Example = new OpenApiObject
            {
                ["username"] = new OpenApiString("carlos.rubio"),
                ["email"] = new OpenApiString("carlos.rubio@losrezagados.com"),
                ["password"] = new OpenApiString("MiClaveSegura#2026"),
                ["role"] = new OpenApiString("admin")
            };

            SetPropertyExample(schema, "username", "carlos.rubio");
            SetPropertyExample(schema, "email", "carlos.rubio@losrezagados.com");
            SetPropertyExample(schema, "password", "MiClaveSegura#2026");
            SetPropertyExample(schema, "role", "admin");
            return;
        }

        if (typeName == "ForgotPasswordDto")
        {
            schema.Example = new OpenApiObject
            {
                ["email"] = new OpenApiString("carlos.rubio@losrezagados.com")
            };

            SetPropertyExample(schema, "email", "carlos.rubio@losrezagados.com");
            return;
        }

        if (typeName == "ResetPasswordDto")
        {
            schema.Example = new OpenApiObject
            {
                ["email"] = new OpenApiString("carlos.rubio@losrezagados.com"),
                ["token"] = new OpenApiString("reset-token-ejemplo-def456"),
                ["newPassword"] = new OpenApiString("NuevaClaveSegura#2026")
            };

            SetPropertyExample(schema, "email", "carlos.rubio@losrezagados.com");
            SetPropertyExample(schema, "token", "reset-token-ejemplo-def456");
            SetPropertyExample(schema, "newPassword", "NuevaClaveSegura#2026");
        }
    }

    private static void SetPropertyExample(OpenApiSchema schema, string propertyName, string example)
    {
        var key = schema.Properties.Keys
            .FirstOrDefault(k => string.Equals(k, propertyName, StringComparison.OrdinalIgnoreCase));

        if (key is not null)
        {
            schema.Properties[key].Example = new OpenApiString(example);
        }
    }

    private static void SetPropertyDescription(OpenApiSchema schema, string propertyName, string description)
    {
        var key = schema.Properties.Keys
            .FirstOrDefault(k => string.Equals(k, propertyName, StringComparison.OrdinalIgnoreCase));

        if (key is not null)
        {
            schema.Properties[key].Description = description;
        }
    }
}

