package logger

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Logger struct {
	ctx context.Context
}

func New() *Logger {
	return &Logger{}
}

func (log *Logger) Boot(ctx context.Context) {
	log.ctx = ctx
}

func (log *Logger) Error(message string) {
	runtime.LogError(log.ctx, message)
}

func (log *Logger) Errorf(format string, args ...interface{}) {
	runtime.LogErrorf(log.ctx, format, args...)
}

func (log *Logger) Debugf(format string, args ...interface{}) {
	runtime.LogDebugf(log.ctx, format, args...)
}

func (log *Logger) Fatalf(format string, args ...interface{}) {
	runtime.LogFatalf(log.ctx, format, args...)
}
