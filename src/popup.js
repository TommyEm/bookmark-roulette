const STORAGE_KEY = "bookmark-roulette";
let bookmarksArray = [];

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getFilteredBookmarks = (bookmarks, folderName) => {
  for (var i = 0; i < bookmarks.length; i++) {
    var bookmark = bookmarks[i];

    if (
      bookmark.children &&
      bookmark.title.toLowerCase() === folderName.toLowerCase()
    ) {
      bookmarksArray.push(...bookmark.children);
    }

    if (bookmark.children) {
      getFilteredBookmarks(bookmark.children, folderName);
    }
  }
};

document.addEventListener("DOMContentLoaded", async (event) => {
  const checkPageButton = document.getElementById("open-bookmarks");
  const folderNameInput = document.getElementById("folder-name");
  chrome.storage.sync.get([STORAGE_KEY]).then((result) => {
    try {
      const savedFolderName = result[STORAGE_KEY];
      folderNameInput.value = savedFolderName;
      folderName = savedFolderName ?? "";
    } catch (err) {
      console.log(err);
    }
  });

  folderNameInput.addEventListener("change", async () => {
    const newFolderName = document.getElementById("folder-name").value;

    try {
      chrome.storage.sync.set({ [STORAGE_KEY]: newFolderName }).then(() => {
        folderName = newFolderName;
      });
    } catch (err) {
      console.log(err);
    }
  });

  checkPageButton.addEventListener("click", async () => {
    try {
      const bookmarkTree = await chrome.bookmarks.getTree();
      getFilteredBookmarks(bookmarkTree, folderName);

      const bookmarks = bookmarksArray.map((bookmark) => bookmark.url);
      const shuffledBookmarks = shuffleArray(bookmarks);

      shuffledBookmarks.map(async (bookmarkURL, i) => {
        await chrome.tabs.create({
          index: i,
          active: i === 0,
          url: bookmarkURL,
        });
      });
    } catch (err) {
      console.log(err);
    }
  });
});
