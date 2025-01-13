package store

import (
	"encoding/json"
	"errors"
	"tinkerpad/backend/storage"
)

type StoreData struct {
	name     string
	filename string
}

func (store *StoreData) SaveData(storage *storage.Storage, data string) error {
	byteData := []byte(data)

	if !json.Valid(byteData) {
		return errors.New("invalid store json data")
	}

	if err := storage.Store(byteData, "store", store.filename); err != nil {
		return err
	}

	return nil
}

func (store *StoreData) GetData(storage *storage.Storage) string {
	data, err := storage.Load("store", store.filename)
	if err != nil {
		data = make([]byte, 0)
	}

	return string(data)
}
