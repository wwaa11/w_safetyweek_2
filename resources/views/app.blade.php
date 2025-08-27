<!DOCTYPE html>
<html lang="{{ str_replace("_", "-", app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config("app.name", "Laravel") }}</title>

    <link rel="icon" href="{{ url("PR9/Logo.ico") }}" sizes="any">
    <link rel="icon" href="{{ url("PR9/Logo.png") }}" type="image/png">
    <link rel="apple-touch-icon" href="{{ url("PR9/Logo.png") }}">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @routes
    @viteReactRefresh
    @vite(["resources/js/app.tsx", "resources/js/pages/{$page["component"]}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
