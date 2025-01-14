<?php

use Psy\Shell;

if (is_file($cwd . '/bootstrap/app.php')) {
    $app = require_once $cwd . '/bootstrap/app.php';

    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    $shellSetups[] = function (Shell $shell) use ($cwd): void {
        $classMap = $cwd . '/vendor/composer/autoload_classmap.php';

        if (file_exists($classMap) && class_exists('Laravel\Tinker\ClassAliasAutoloader')) {
            Laravel\Tinker\ClassAliasAutoloader::register($shell, $classMap);
        }
    };

    if ($code === null) {
        $info = json_encode([
            'framework_name' => 'Laravel',
            'framework_version' => $app->version(),
            'php_version' => phpversion(),
        ]);
    }
}