package favorites

import (
	"encoding/json"
	"slices"
	"strings"
	"tinkerpad/backend/logger"
	"tinkerpad/backend/storage"
)

type Favorites struct {
	log     *logger.Logger
	storage *storage.Storage
}

type Favorite struct {
	Uuid       string `json:"uuid"`
	Name       string `json:"name"`
	Code       string `json:"code"`
	WorkingDir string `json:"workingDir"`
	Timestamp  int    `json:"timestamp"`
}

const filename = "favorites.json"

func New() *Favorites {
	return &Favorites{}
}

func (favs *Favorites) Boot(log *logger.Logger, storage *storage.Storage) {
	favs.log = log
	favs.storage = storage
}

func (favs *Favorites) GetAll() []Favorite {
	favorites := []Favorite{}
	js, err := favs.storage.Load(filename)
	if err != nil {
		return favorites
	}
	if err = json.Unmarshal(js, &favorites); err != nil {
		favs.log.Errorf("failed to unmarshal favorites: %v", err)
	}
	slices.SortFunc(favorites, func(a, b Favorite) int {
		return strings.Compare(strings.ToLower(a.Name), strings.ToLower(b.Name))
	})
	return favorites
}

func (favs *Favorites) Save(favorites []Favorite) error {
	js, err := json.Marshal(favorites)
	if err != nil {
		return err
	}
	if err = favs.storage.Store(js, filename); err != nil {
		return err
	}
	return nil
}
