<?php

use Psy\Shell;
use Psy\Configuration;
use Psy\VarDumper\Cloner;
use Psy\ExecutionLoopClosure;
use Symfony\Component\Console\Output\BufferedOutput;

require 'vendor/autoload.php';

$cwd = $argv[1];
$code = $argv[2] ?? null;

require_once 'src/composer.php';
require_once 'src/laravel.php';
require_once 'src/wordpress.php';

if ($code === null) {
    $info ??= json_encode([
        'framework_name' => 'PHP',
        'php_version' => phpversion(),
    ]) . PHP_EOL;

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

(fn () => $this->cloner = new Cloner())->call($config->getPresenter());

$config->getPresenter()->addCasters(['*' => fn ($_, array $a): array => $a]);
$config->getPresenter()->addCasters($casters);

$output = new BufferedOutput();
$shell = new Shell($config);

$shell->setOutput($output);
$shell->addInput(base64_decode($code));

(new ExecutionLoopClosure($shell))->execute();

echo $output->fetch() . PHP_EOL;