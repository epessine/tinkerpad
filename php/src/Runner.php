<?php

namespace Tinkerpad\Php;

use Psy\CodeCleaner\NoReturnValue;
use Psy\Configuration;
use Psy\VarDumper\Cloner;
use Tinkerpad\Php\Booters;
use Tinkerpad\Php\Psy\Shell;
use Psy\Exception\ThrowUpException;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\VarDumper\Dumper\CliDumper;
use Symfony\Component\VarDumper\VarDumper;
use Symfony\Component\VarDumper\Dumper\HtmlDumper;
use Tinkerpad\Php\Exceptions\DieException;
use Tinkerpad\Php\Psy\ExecutionClosure;

class Runner
{
    protected static self $instance;

    protected array $booters = [
        Booters\Composer::class,
        Booters\Symphony::class,
        Booters\Wordpress::class,
        Booters\Laravel::class,
    ];

    protected string $cwd;

    protected ?string $code;

    protected ?array $info;

    protected array $setups = [];

    protected Shell $shell;

    protected array $outputs = [];

    protected int $peakMemoryUsage = 0;

    protected float $time;

    public function __construct(array $argv)
    {
        $this->cwd = $argv[1];
        $this->code = $argv[2] ?? null;

        Runner::$instance = $this;
    }

    public static function getInstance(): self
    {
        return Runner::$instance;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function getInfo(): ?array
    {
        return $this->info;
    }

    public function getShell(): Shell
    {
        return $this->shell;
    }

    public function getOutputs(): array
    {
        return $this->outputs;
    }

    public function addOutput(mixed $output): self
    {
        if ($output instanceof DieException) {
            return $this;
        }

        $output = (new Cloner($this->getCasters()))->cloneVar($output);

        $htmlDumper = new HtmlDumper;
        $htmlDumper->setStyles(['default' => '']);

        $this->outputs[] = [
            'raw' => (new CliDumper())->dump($output, true),
            'html' => base64_encode($htmlDumper->dump($output, true)),
        ];

        return $this;
    }

    public function setPeakMemoryUsage(int $peakMemoryUsage): self
    {
        $this->peakMemoryUsage = $peakMemoryUsage;

        return $this;
    }

    public function getPeakMemoryUsage(): int
    {
        return $this->peakMemoryUsage;
    }

    public function setTime(float $time): self
    {
        $this->time = $time;

        return $this;
    }

    public function getTime(): float
    {
        return $this->time;
    }

    public function boot(): self
    {
        foreach ($this->booters as $booter) {
            $booter::boot($this->cwd);

            if ($info = $booter::getInfo()) {
                $this->info = $info;
                $this->setups = array_merge($this->setups, $booter::getSetups());
            }
        }

        if ($this->code === null) {
            return $this;
        }

        $this->shell = new Shell($this->getPsyConfig());

        $this->shell->setOutput(new BufferedOutput());

        VarDumper::setHandler(function ($var) {
            ob_flush();
            Runner::getInstance()->addOutput($var);
        });

        foreach ($this->setups as $setup) {
            $setup($this->shell);
        }

        return $this;
    }

    public function run(): self
    {
        try {
            $this->shell->addCode($this->removeComments($this->code));
            
            $var = (new ExecutionClosure($this->shell))->execute();

            if ($var && !($var instanceof NoReturnValue)) {
                $this->addOutput($var);
            }
        } catch (ThrowUpException $th) {
            throw $th;
        } catch (\Throwable $e) {
            $this->addOutput($e);
        }

        return $this;
    }

    protected function getPsyConfig(): Configuration
    {
        return new Configuration([
            'updateCheck' => 'never',
            'configFile' => null,
            'usePcntl' => false,
            'historySize' => 1,
            'interactiveMode' => Configuration::INTERACTIVE_MODE_DISABLED,
            'theme' => 'compact',
            'verbosity' => Configuration::VERBOSITY_DEBUG,
        ]);
    }

    protected function getCasters(): array
    {
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

        return $casters;
    }

    protected function removeComments(string $code): string
    {
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

        return $cleanedCode;
    }
}