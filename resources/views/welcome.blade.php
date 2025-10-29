<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kanban – En cours de construction</title>
  <style>
    :root {
      --bg: #0f0f10;
      --card-bg: #18181b;
      --accent: #8b5cf6;
      --text: #e5e5e5;
      --muted: #9ca3af;
      --border: #27272a;
    }

    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: var(--bg);
      font-family: "Inter", system-ui, sans-serif;
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 2.5rem 3rem;
      text-align: center;
      box-shadow: 0 0 25px rgba(0,0,0,0.3);
      max-width: 500px;
      animation: fadeIn 1s ease forwards;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: var(--accent);
      letter-spacing: 0.5px;
    }

    p {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--muted);
      margin-bottom: 1.5rem;
    }

    .loader {
      width: 80px;
      height: 80px;
      border: 6px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem auto;
    }

    footer {
      font-size: 0.85rem;
      color: var(--muted);
      margin-top: 1rem;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 500;
    }

    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="loader"></div>
    <h1>Kanban en cours de construction</h1>
    <p>Nous travaillons actuellement sur une nouvelle version du <strong>Kanban</strong>.<br>
    Revenez bientôt pour découvrir un espace plus rapide, plus fluide et plus élégant.</p>

    <p> Test page: <a href="/test/kanban" target="_blank" rel="noopener">/test/kanban</a> </p>
  </div>
</body>
</html>
