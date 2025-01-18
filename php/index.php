<?php

use NunoMaduro\Collision\Writer;
use Psy\Shell;
use Psy\Configuration;
use Psy\VarDumper\Cloner;
use Psy\ExecutionLoopClosure;
use Psy\Exception\BreakException;
use Psy\Exception\ThrowUpException;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\VarDumper\VarDumper;
use Whoops\Exception\Inspector;

require 'vendor/autoload.php';

class CustomShell extends Shell
{
    public ?Writer $writer;

    public function __construct(?Configuration $config = null, ?Writer $writer = null)
    {
        parent::__construct($config);

        $this->writer = $writer;
    }

    public function writeException(\Throwable $e)
    {
        if ($e instanceof BreakException) {
            return;
        }
        
        $this->writer->write(new Inspector($e));
    }
}

$collision = (new \NunoMaduro\Collision\Provider)->register();

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
    'usePcntl' => false,
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
    VarDumper::setHandler(function ($var, ?string $label = null) {
        $var = $this->cloner->cloneVar($var);

        if (null !== $label) {
            $var = $var->withContext(['label' => $label]);
        }

        $this->dumper->dump($var);
    });
})->call($config->getPresenter());

$config->getPresenter()->addCasters(['*' => function ($_, array $a): array {
    return $a;
}]);
$config->getPresenter()->addCasters($casters);

$output = new BufferedOutput();

$writer = $collision->getHandler()->getWriter();

$writer->ignoreFilesIn(['/vendor/'])
    ->showEditor(false)
    ->setOutput($output);

$shell = new CustomShell($config, $writer);
$shell->setOutput($output);

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
} catch (ThrowUpException $th) {
    throw $th;
} catch (\Throwable $th) {
    $shell->writeException($th);
}

echo trim($output->fetch());
