<?php

if (is_file($cwd . '/bootstrap/app.php')) {
    $app = require_once $cwd . '/bootstrap/app.php';

    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    $aliases = require $cwd . '/vendor/composer/autoload_classmap.php';

    foreach ($aliases as $class => $path) {
        if (!str_contains($class, '\\') || str_starts_with($path, $cwd . '/vendor')) {
            continue;
        }

        rescue(fn () => class_alias($class, class_basename($class)), null, false);
    }

    if ($code === null) {
        $info = json_encode([
            'framework_name' => 'Laravel',
            'framework_version' => $app->version(),
            'php_version' => phpversion(),
        ]) . PHP_EOL;
    }
}