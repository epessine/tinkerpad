package store

import (
	"fmt"
	"tinkerpad/backend/logger"
	"tinkerpad/backend/storage"
)

type StoreName string

const (
	General StoreName = "general"
	Code    StoreName = "code"
)

var Stores = []struct {
	Value  StoreName
	TSName string
}{
	{General, "General"},
	{Code, "Code"},
}

type Store struct {
	log     *logger.Logger
	storage *storage.Storage
	stores  []*StoreData
}

func New() *Store {
	stores := make([]*StoreData, len(Stores))

	for i, s := range Stores {
		stores[i] = &StoreData{
			name:     string(s.Value),
			filename: fmt.Sprintf("%s.json", s.Value),
		}
	}

	return &Store{stores: stores}
}

func (store *Store) Boot(log *logger.Logger, storage *storage.Storage) {
	store.log = log
	store.storage = storage
}

func (store *Store) Save(name string, data string) error {
	return store.find(name).SaveData(store.storage, data)
}

func (store *Store) GetData(name string) string {
	return store.find(name).GetData(store.storage)
}

func (store *Store) find(name string) *StoreData {
	for _, storeData := range store.stores {
		if name == storeData.name {
			return storeData
		}
	}

	return nil
}
