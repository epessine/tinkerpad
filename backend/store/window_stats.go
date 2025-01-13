package store

import (
	"encoding/json"
)

type GeneralStore struct {
	Window WindowStats `json:"window"`
}

type WindowStats struct {
	Width  int `json:"width"`
	Height int `json:"height"`
	X      int `json:"x"`
	Y      int `json:"y"`
}

func (store *Store) GetWindowStats() (WindowStats, error) {
	rawData := store.GetData(string(General))
	generalStore := GeneralStore{}

	if err := json.Unmarshal([]byte(rawData), &generalStore); err != nil {
		return WindowStats{}, err
	}

	return generalStore.Window, nil
}
