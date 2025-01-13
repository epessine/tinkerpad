package dialog

import (
	"context"
	"tinkerpad/backend/logger"
	"tinkerpad/backend/settings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Dialog struct {
	ctx      context.Context
	log      *logger.Logger
	settings *settings.Settings
}

func New() *Dialog {
	return &Dialog{}
}

func (dialog *Dialog) Boot(ctx context.Context, log *logger.Logger, settings *settings.Settings) {
	dialog.ctx = ctx
	dialog.log = log
	dialog.settings = settings
}

func (dialog *Dialog) SelectDir() string {
	dir, err := runtime.OpenDirectoryDialog(dialog.ctx, dialog.getOptions())
	if err != nil {
		dialog.log.Errorf("failed to open directory dialog: %v", err)
		return ""
	}

	return dir
}

func (dialog *Dialog) SelectFile() string {
	file, err := runtime.OpenFileDialog(dialog.ctx, dialog.getOptions())
	if err != nil {
		dialog.log.Errorf("failed to open file dialog: %v", err)
		return ""
	}

	return file
}

func (dialog *Dialog) SelectPhpBinary() string {
	phpBinary := dialog.SelectFile()

	if phpBinary == "" {
		return ""
	}

	if dialog.settings.IsValidPhpBinaryPath(phpBinary) {
		return phpBinary
	}

	return ""
}

func (dialog *Dialog) Confirm(msg string) bool {
	options := runtime.MessageDialogOptions{
		Type:          runtime.QuestionDialog,
		Message:       msg,
		Buttons:       []string{"Yes", "Cancel"},
		DefaultButton: "Yes",
		CancelButton:  "Cancel",
	}

	res, err := runtime.MessageDialog(dialog.ctx, options)
	if err != nil {
		dialog.log.Errorf("failed to confirm dialog: %v", err)
		return false
	}

	return res == "Yes"
}

func (dialog *Dialog) Warning(msg string) {
	options := runtime.MessageDialogOptions{
		Type:    runtime.WarningDialog,
		Message: msg,
	}

	runtime.MessageDialog(dialog.ctx, options)
}

func (dialog *Dialog) Error(msg string) {
	options := runtime.MessageDialogOptions{
		Type:    runtime.ErrorDialog,
		Message: msg,
	}

	runtime.MessageDialog(dialog.ctx, options)
}

func (dialog *Dialog) Info(msg string) {
	options := runtime.MessageDialogOptions{
		Type:    runtime.InfoDialog,
		Message: msg,
	}

	runtime.MessageDialog(dialog.ctx, options)
}

func (dialog *Dialog) getOptions() runtime.OpenDialogOptions {
	return runtime.OpenDialogOptions{
		DefaultDirectory:           dialog.settings.App.DefaultWorkingDir,
		ShowHiddenFiles:            true,
		TreatPackagesAsDirectories: true,
	}
}
