<?php

use Psy\Shell;
use Psy\Configuration;
use Psy\VarDumper\Cloner;
use Psy\ExecutionLoopClosure;
use Symfony\Component\Console\Output\BufferedOutput;

require 'vendor/autoload.php';

$cwd = $argv[1];
$code = $argv[2] ?? null;
$shellSetups = [];

require_once 'src/composer.php';
require_once 'src/laravel.php';
require_once 'src/wordpress.php';

if ($code === null) {
    $info ??= json_encode([
        'framework_name' => 'PHP',
        'php_version' => phpversion(),
    ]);

    echo $info . PHP_EOL;

    exit(0);
}

$config = new Configuration([
    'updateCheck' => 'never',
    'configFile' => null,
    'historySize' => 1,
    'interactiveMode' => Configuration::INTERACTIVE_MODE_DISABLED,
    'theme' => 'compact',
    'verbosity' => Configuration::VERBOSITY_DEBUG,
]);

$casters = [
    'Illuminate\Support\Collection' => 'Laravel\Tinker\TinkerCaster::castCollection',
    'Illuminate\Database\Eloquent\Model' => 'Laravel\Tinker\TinkerCaster::castModel',
    'Illuminate\Foundation\Application' => 'Laravel\Tinker\TinkerCaster::castApplication',
    'Illuminate\Support\HtmlString' => 'Laravel\Tinker\TinkerCaster::castHtmlString',
    'Illuminate\Support\Stringable' => 'Laravel\Tinker\TinkerCaster::castStringable',
    'Illuminate\Process\ProcessResult' => 'Laravel\Tinker\TinkerCaster::castProcessResult',
];

foreach ($casters as $class => $caster) {
    if (!class_exists($class) || !class_exists(explode('::', $caster)[0])) {
        unset($casters[$class]);
    }
}

(function (): void {
    $this->cloner = new Cloner();
})->call($config->getPresenter());

$config->getPresenter()->addCasters(['*' => function ($_, array $a): array {
    return $a;
}]);
$config->getPresenter()->addCasters($casters);

$shell = new Shell($config);
$shell->setOutput($output = new BufferedOutput());

foreach ($shellSetups as $setup) {
    $setup($shell);
}

try {
    $cleanedCode = '';

    foreach (token_get_all(base64_decode($code)) as $token) {
        if (is_string($token)) {
            $cleanedCode .= $token;

            continue;
        }
        
        if (in_array($token[0], [T_COMMENT, T_DOC_COMMENT, T_OPEN_TAG, T_CLOSE_TAG])) {
            continue;
        }

        $cleanedCode .= $token[1];
    }

    $shell->addInput($cleanedCode);
    
    (new ExecutionLoopClosure($shell))->execute();
} catch (\Throwable $th) {
    $shell->writeException($th);
}

echo $output->fetch() . PHP_EOL;