// URL mapping, from hash to a function that responds to that URL action
const router = {
  "/": () => showContent("content-home"),
  "/profile": () =>
    requireAuth(() => {
      showContent("content-profile");
      loadGallery();   // <-- call gallery loader when profile page is shown
    }, "/profile"),
  "/login": () => login()
};

const galleryPhotos = [
  {
    file: "https://raw.githubusercontent.com/adldaydream/intranet/main/apps/photos/uploads/09-08-2025_evacuate.png",
    addedBy: "Ben",
    date: "2025-09-07"
  },
  {
    file: "https://raw.githubusercontent.com/username/repo/main/photo2.jpg",
    addedBy: "Alice",
    date: "2025-09-06"
  }
];


//Declare helper functions

/**
 * Iterates over the elements matching 'selector' and passes them
 * to 'fn'
 * @param {*} selector The CSS selector to find
 * @param {*} fn The function to execute for every element
 */
const eachElement = (selector, fn) => {
  for (let e of document.querySelectorAll(selector)) {
    fn(e);
  }
};

/**
 * Tries to display a content panel that is referenced
 * by the specified route URL. These are matched using the
 * router, defined above.
 * @param {*} url The route URL
 */
const showContentFromUrl = (url) => {
  if (router[url]) {
    router[url]();
    return true;
  }

  return false;
};

/**
 * Returns true if `element` is a hyperlink that can be considered a link to another SPA route
 * @param {*} element The element to check
 */
const isRouteLink = (element) =>
  element.tagName === "A" && element.classList.contains("route-link");

/**
 * Displays a content panel specified by the given element id.
 * All the panels that participate in this flow should have the 'page' class applied,
 * so that it can be correctly hidden before the requested content is shown.
 * @param {*} id The id of the content to show
 */
const showContent = (id) => {
  eachElement(".page", (p) => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
};

function loadGallery() {
  const gallery = document.getElementById("photo-gallery");
  if (!gallery) return;
  gallery.innerHTML = "";

  galleryPhotos.forEach(photo => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    col.innerHTML = `
      <div class="card shadow-sm">
        <img src="${photo.file}" class="card-img-top" alt="Photo">
        <div class="card-body">
          <p class="card-text"><strong>Added by:</strong> ${photo.addedBy}</p>
          <p class="card-text"><strong>Date:</strong> ${photo.date}</p>
        </div>
      </div>
    `;

    gallery.appendChild(col);
  });
}



/**
 * Updates the user interface
 */
const updateUI = async () => {
  try {
    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
      const user = await auth0Client.getUser();

      document.getElementById("profile-data").innerText = JSON.stringify(
        user,
        null,
        2
      );

      document.querySelectorAll("pre code").forEach(hljs.highlightBlock);

      eachElement(".profile-image", (e) => (e.src = user.picture));
      eachElement(".user-name", (e) => (e.innerText = user.name));
      eachElement(".user-email", (e) => (e.innerText = user.email));
      eachElement(".auth-invisible", (e) => e.classList.add("hidden"));
      eachElement(".auth-visible", (e) => e.classList.remove("hidden"));
    } else {
      eachElement(".auth-invisible", (e) => e.classList.remove("hidden"));
      eachElement(".auth-visible", (e) => e.classList.add("hidden"));
    }
  } catch (err) {
    console.log("Error updating UI!", err);
    return;
  }

  console.log("UI updated");
};

window.onpopstate = (e) => {
  if (e.state && e.state.url && router[e.state.url]) {
    showContentFromUrl(e.state.url);
  }
};
