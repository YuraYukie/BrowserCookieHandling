var manifest = chrome.runtime.getManifest();
manifest.id = chrome.runtime.id;

$( document ).ready(function() {
    init();
});

function init() {
    $(".title").text(manifest.name);
}
