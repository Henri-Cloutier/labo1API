//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
  renderBookmarks();
  $("#createBookmark").on("click", async function () {
    saveContentScrollPosition();
    renderCreateBookmarkForm();
  });
  $("#abort").on("click", async function () {
    renderBookmarks();
    $("#createBookmark").show();
  });
  $("#aboutCmd").on("click", function () {
    renderAbout();
  });
}

function renderAbout() {
  saveContentScrollPosition();
  eraseContent();
  $("#createBookmark").hide();
  $("#abort").show();
  $("#actionTitle").text("À propos...");
  $("#content").append(
    $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de favoris</h2>
                <hr>
                <p>
                    Application de gestion des favoris.
                </p>
                <p>
                    Auteur: Henri Cloutier
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2024
                </p>
            </div>
        `)
  );
}
async function renderBookmarks() {
  showWaitingGif();
  $("#actionTitle").text("Liste des favoris");
  $("#createBookmark").show();
  $("#abort").hide();
  let bookmarks = await API_GetBookmarks();
  let bookmarkCategories = [];

  bookmarks.forEach((bookmark) => {
    if (!bookmarkCategories.includes(bookmark.Category)) {
      bookmarkCategories.push(bookmark.Category);
      $('#categories').append(renderBookmarkCategory(bookmark.Category));
      
    }
  })
  eraseContent();
  if (bookmarks !== null) {
    bookmarks.forEach((bookmark) => {
      $("#content").append(renderBookmark(bookmark));
    });
    restoreContentScrollPosition();
    // Attached click events on command icons
    $(".editCmd").on("click", function () {
      saveContentScrollPosition();
      renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
    });
    $(".deleteCmd").on("click", function () {
      saveContentScrollPosition();
      renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
    });
    $(".contactRow").on("click", function (e) {
      e.preventDefault();
    });
  } else {
    renderError("Service introuvable");
  }
}
function chooseCategory(category) {
  
}
function renderBookmarkCategory(category) {
  return $(`
    
        <div class="dropdown-item bookmarkCategory" id="${category}">
          <div>${$("#chosenCategory").value == category ? '<i class="fa-solid fa-check"></i>' : ""}</div>  
          <div>${category}</div>
        </div>
    `);
}
function showWaitingGif() {
  $("#content").empty();
  $("#content").append(
    $(
      "<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"
    )
  );
}
function eraseContent() {
  $("#content").empty();
}
function saveContentScrollPosition() {
  contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
  $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
  eraseContent();
  $("#content").append(
    $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
  );
}
function renderCreateBookmarkForm() {
  renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
  showWaitingGif();
  let contact = await API_GetBookmark(id);
  if (contact !== null) renderBookmarkForm(contact);
  else renderError("Favoris introuvable!");
}
async function renderDeleteBookmarkForm(id) {
  showWaitingGif();
  $("#createBookmark").hide();
  $("#abort").show();
  $("#actionTitle").text("Retrait");
  let bookmark = await API_GetBookmark(id);
  eraseContent();
  if (bookmark !== null) {
    $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le contact suivant?</h4>
            <br>
            <div class="bookmarkContainer">
                <div>
                    <a class="bookmarkTitleLine" href="${bookmark.Url}" target="_blank">
                        <img src="http://www.google.com/s2/favicons?domain=${bookmark.Url}" alt="" class="bookmarkIcon">
                        <div class="bookmarkTitle">${bookmark.Title}</div>    
                    </a>
                    <div class="bookmarkType">${bookmark.Category}</div>
                </div>
            </div>
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
    $("#deleteBookmark").on("click", async function () {
      showWaitingGif();
      let result = await API_DeleteBookmark(bookmark.Id);
      if (result) renderBookmarks();
      else renderError("Une erreur est survenue!");
    });
    $("#cancel").on("click", function () {
      renderBookmarks();
    });
  } else {
    renderError("Contact introuvable!");
  }
}
function newBookmark() {
  bookmark = {};
  bookmark.Id = 0;
  bookmark.Title = "";
  bookmark.Url = "";
  bookmark.Category = "";
  return bookmark;
}
function renderBookmarkForm(bookmark = null) {
  //TODO
  $("#createBookmark").hide();
  $("#abort").show();
  eraseContent();
  let create = bookmark == null;
  if (create) bookmark = newBookmark();
  $("#actionTitle").text(create ? "Création" : "Modification");
  $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>

            <img id="bookmarkIcon" src="${bookmark.Url == null ? 'http://www.google.com/s2/favicons?domain=' + bookmark.Url : 'bookmark-logo.svg'}" alt="" class="bookmarkIcon"></br>
            <label for="Title" class="form-label">Titre</label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Url" class="form-label">Url</label>
            <input
                class="form-control"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer un lien" 
                InvalidMessage="Veuillez entrer un lien valide"
                value="${bookmark.Url}" 
            />
            <label for="Category" class="form-label">Catégorie</label>
            <input 
                class="form-control"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer une catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${bookmark.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
  initFormValidation();
  $("#Url").on("change", function () {
    let url = $(this).val();
    $("#bookmarkIcon").attr("src", "http://www.google.com/s2/favicons?domain=" + url);
    
  })
  $("#bookmarkForm").on("submit", async function (event) {
    event.preventDefault();
    let bookmark = getFormData($("#bookmarkForm"));
    bookmark.Id = parseInt(bookmark.Id);
    showWaitingGif();
    let result = await API_SaveBookmark(bookmark, create);
    if (result) renderBookmarks();
    else renderError("Une erreur est survenue!");
  });
  $("#cancel").on("click", function () {
    renderBookmarks();
  });
}

function getFormData($form) {
  const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
  var jsonObject = {};
  $.each($form.serializeArray(), (index, control) => {
    jsonObject[control.name] = control.value.replace(removeTag, "");
  });
  return jsonObject;
}

function renderBookmark(bookmark) {
  return $(`
        <div class="bookmarkContainer noselect">
                <div>
                    <a class="bookmarkTitleLine" href="${bookmark.Url}" target="_blank">
                        <img src="http://www.google.com/s2/favicons?domain=${bookmark.Url}" alt="" class="bookmarkIcon">
                        <div class="bookmarkTitle">${bookmark.Title}</div>    
                    </a>
                    <div class="bookmarkType">${bookmark.Category}</div>
                </div>
                <div class="cmdIconContainer">
                  <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Name}"></span>
                  <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Name}"></span>
                </div>
            </div>
    `);
}
