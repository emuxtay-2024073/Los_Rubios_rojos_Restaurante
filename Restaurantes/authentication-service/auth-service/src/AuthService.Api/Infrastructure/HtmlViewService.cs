using System;

namespace AuthService.Api.Infrastructure;

public class HtmlViewService : IHtmlViewService
{
    public string GetSuccessPage(string message, string? frontendUrl)
    {
        var actionHtml = "<div class=\"icon success\">✓</div>";
        if (!string.IsNullOrWhiteSpace(frontendUrl))
        {
            var cleanUrl = frontendUrl.Trim().TrimEnd('/');
            actionHtml += $@"
            <script>
                var redirectUrl = '{cleanUrl}/login';
                var countdown = 4;
                function redirect() {{
                    if (countdown > 0) {{
                        document.getElementById('countdown').innerText = countdown;
                        countdown--;
                        setTimeout(redirect, 1000);
                    }} else {{
                        window.location.href = redirectUrl;
                    }}
                }}
                window.onload = function() {{ redirect(); }};
            </script>
            <div id=""redirectContainer"" style=""text-align:center;margin-top:24px;"">
                <p style=""margin:0 0 16px;font-size:14px;color:#666;"">
                    Te llevaremos al inicio de sesión en <span id=""countdown"" style=""font-weight:bold;font-size:18px;color:#a91010;"">4</span> segundos...
                </p>
                <a href=""{cleanUrl}/login"" style=""display:inline-block;background:#a91010;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;transition:background 0.3s;"">Ir ahora al login</a>
            </div>";
        }

        return GetHtmlPage("¡Verificación exitosa!", message, actionHtml);
    }

    public string GetErrorPage(string message)
    {
        var actionHtml = "<div class=\"icon error\">✕</div>";
        return GetHtmlPage("Error al verificar el correo", message, actionHtml);
    }

    private static string GetHtmlPage(string title, string body, string actionButtonHtml)
    {
        return $@"<!DOCTYPE html>
<html lang=""es"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>{title}</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #fff9ee 0%, #f7dfb8 48%, #fff3db 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }}
    .container {{
      max-width: 520px;
      width: 100%;
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
      padding: 48px 32px;
      text-align: center;
      animation: slideUp 0.6s ease-out;
    }}
    @keyframes slideUp {{
      from {{ transform: translateY(30px); opacity: 0; }}
      to {{ transform: translateY(0); opacity: 1; }}
    }}
    .icon {{
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      animation: scaleIn 0.6s ease-out;
    }}
    @keyframes scaleIn {{
      from {{ transform: scale(0.8); opacity: 0; }}
      to {{ transform: scale(1); opacity: 1; }}
    }}
    .icon.success {{
      background: #d1fae5;
      color: #059669;
    }}
    .icon.error {{
      background: #fee2e2;
      color: #dc2626;
    }}
    h1 {{
      font-size: 28px;
      color: #1f2937;
      margin-bottom: 16px;
      font-weight: 700;
    }}
    h1.success {{ color: #059669; }}
    h1.error {{ color: #dc2626; }}
    .body {{
      font-size: 16px;
      line-height: 1.75;
      color: #4b5563;
      margin-bottom: 28px;
    }}
    .logo {{
      margin-bottom: 24px;
      font-size: 12px;
      letter-spacing: 3px;
      text-transform: uppercase;
      font-weight: 800;
      color: #a91010;
    }}
    #redirectContainer {{
      margin-top: 24px;
    }}
    #countdown {{
      font-weight: bold;
      font-size: 20px;
      color: #a91010;
    }}
  </style>
</head>
<body>
  <div class=""container"">
    <div class=""logo"">Los Rubios Rojos</div>
    {actionButtonHtml}
    <div class=""body"">{body}</div>
  </div>
</body>
</html>";
    }
}
