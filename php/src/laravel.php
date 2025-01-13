<?php

if (is_file($cwd . '/bootstrap/app.php')) {
    $app = require_once $cwd . '/bootstrap/app.php';

    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    $aliases = require_once $cwd . '/vendor/composer/autoload_classmap.php';

    foreach ($aliases as $class => $path) {
        if (!str_contains($class, '\\') || str_starts_with($path, $cwd . '/vendor')) {
            continue;
        }

        try {
            class_alias($class, class_basename($class));
        } catch (\Throwable $th) {
        }
    }

    if ($code === null) {
        $info = json_encode([
            'framework_name' => 'Laravel',
            'framework_version' => $app->version(),
            'php_version' => phpversion(),
        ]);
    }
}