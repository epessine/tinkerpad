<?php

namespace Tinkerpad\Php\Booters;

use Psy\Shell;

class Laravel extends Booter
{
    public static function boot(string $cwd): void
    {
        if (!is_file($cwd . '/bootstrap/app.php')) {
            return;
        }

        $app = require_once $cwd . '/bootstrap/app.php';

        $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

        static::$setups[] = function (Shell $shell) use ($cwd): void {
            $classMap = $cwd . '/vendor/composer/autoload_classmap.php';

            if (file_exists($classMap) && class_exists('Laravel\Tinker\ClassAliasAutoloader')) {
                \Laravel\Tinker\ClassAliasAutoloader::register($shell, $classMap);
            }
        };

        static::$info = [
            'framework_name' => 'Laravel',
            'framework_version' => $app->version(),
            'php_version' => phpversion(),
        ];
    }
}