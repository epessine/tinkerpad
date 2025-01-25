<?php

use Tinkerpad\Php\Runner;

require 'src/overrides.php';
require 'vendor/autoload.php';

$runAt = microtime(true);

try {
    $runner = (new Runner($argv))->boot();
    
    if ($runner->getCode() === null && $runner->getInfo() !== null) {
        echo json_encode($runner->getInfo());

        return;
    }
} catch (\Throwable $th) {
    $runner->addOutput($th);
}

echo json_encode([
    'outputs' => $runner->run()->getOutputs(),
    'runAt' => $runAt,
    'time' => $runner->getTime(),
    'peakMemoryUsage' => $runner->getPeakMemoryUsage(),
]);
