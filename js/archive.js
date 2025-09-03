window.addEventListener('load', async () => {
  createArchiveDropdownButton("Client Binaries", "browse.html?type=cb");
  createArchiveDropdownButton("Server tool Binaries", "browse.html?type=pb");
  createArchiveDropdownButton("User Tools", "browse.html?type=ut");
  createArchiveDropdownButton("Client Sources", "browse.html?type=cs");
  createArchiveDropdownButton("Server tool Sources", "browse.html?type=ps");
  createArchiveDropdownButton("Development Tools", "browse.html?type=dt");
  createArchiveDropdownButton("LiquidBounce Scripts", "browse.html?type=s_lb");
  createArchiveDropdownButton("Astolfo Scripts", "browse.html?type=s_ao");
  createArchiveDropdownButton("Raven Scripts", "browse.html?type=s_rn");

  // Main
  const gridMain = document.getElementById("button-grid-main");

  if (gridMain == null)
    return;

  const cbButton = createArchiveButton("Client Binaries", "Loading...", "browse.html?type=cb", "binaries", "icons/minecraft.webp");
  const pbButton = createArchiveButton("Server tool Binaries", "Loading...", "browse.html?type=pb", "binaries", "icons/minecraft.webp");
  const utButton = createArchiveButton("User Tools", "Loading...", "browse.html?type=ut", "binaries", "icons/minecraft.webp");

  const csButton = createArchiveButton("Client Sources", "Loading...", "browse.html?type=cs", "sources", "icons/code.webp");
  const psButton = createArchiveButton("Server tool Sources", "Loading...", "browse.html?type=ps", "sources", "icons/code.webp");
  const dtButton = createArchiveButton("Development Tools", "Loading...", "browse.html?type=dt", "sources", "icons/code.webp");

  gridMain.appendChild(cbButton);
  gridMain.appendChild(pbButton);
  gridMain.appendChild(utButton);
  gridMain.appendChild(csButton);
  gridMain.appendChild(psButton);
  gridMain.appendChild(dtButton);

  const gridSecondary = document.getElementById("button-grid-secondary");

  const codeSnippetsButton = createArchiveButton("Code Snippets", "Coming soon!", "#", "sources", "icons/code.webp");
  const mediaButton = createArchiveButton("Media", "Coming soon!", "#", "media", "icons/media.webp");

  gridSecondary.appendChild(codeSnippetsButton);
  gridSecondary.appendChild(mediaButton);

  // Scripts
  const gridScripts = document.getElementById("button-grid-scripts");

  const liquidBounceButton = createArchiveButton("LiquidBounce", "Loading...", "browse.html?type=s_lb", "liquidbounce", null, "icons/liquidbounce.png");
  const astolfoButton = createArchiveButton("Astolfo", "Loading...", "browse.html?type=s_ao", "astolfo", null, "icons/astolfo.png");
  const ravenButton = createArchiveButton("Raven", "Loading...", "browse.html?type=s_rn", "raven", null, "icons/raven.png");

  gridScripts.appendChild(liquidBounceButton);
  gridScripts.appendChild(astolfoButton);
  gridScripts.appendChild(ravenButton);

  // Updating descriptions after all the buttons have been added
  modifyDescription(cbButton, `${await getEntries("https://wonderland.sigmaclient.cloud/getlist.php?type=cb")} entries and counting!`);
  modifyDescription(pbButton, `${await getEntries("https://wonderland.sigmaclient.cloud/getlist.php?type=pb")} entries and counting!`);
  modifyDescription(utButton, `${await getEntries("https://wonderland.sigmaclient.cloud/getlist.php?type=ut")} entries and counting!`);
  modifyDescription(csButton, `${await getEntries("https://wonderland.sigmaclient.cloud/getlist.php?type=cs")} entries and counting!`);
  modifyDescription(psButton, `${await getEntries("https://wonderland.sigmaclient.cloud/getlist.php?type=ps")} entries and counting!`);
  modifyDescription(dtButton, `${await getEntries("https://wonderland.sigmaclient.cloud/getlist.php?type=dt")} entries and counting!`);

  modifyDescription(liquidBounceButton, `${await getEntries("https://wonderland.sigmaclient.cloud/getlist.php?type=s_lb")} entries and counting!`);
  modifyDescription(astolfoButton, `${await getEntries("https://wonderland.sigmaclient.cloud/getlist.php?type=s_ao")} entries and counting!`);
  modifyDescription(ravenButton, `${await getEntries("https://wonderland.sigmaclient.cloud/getlist.php?type=s_rn")} entries and counting!`);
});

function createArchiveButton(name, description, link, style, imgSrc = null, iconSrc = null) {
  const wrapper = document.createElement("a");
  wrapper.href = link;
  wrapper.className = "button-wrapper";

  const element = document.createElement("button");
  element.id = "button";
  element.className = "archive-button";

  const buttonText = document.createElement("div");
  buttonText.className = "button-text";

  const mainLabel = document.createElement("span");
  mainLabel.className = "label-main";
  mainLabel.innerHTML = name;
  buttonText.appendChild(mainLabel);

  const subLabel = document.createElement("span");
  subLabel.className = "label-sub";
  subLabel.innerHTML = description;
  buttonText.appendChild(subLabel);

  element.appendChild(buttonText);

  const background = document.createElement("div");
  background.classList.add("button-background", style);
  element.appendChild(background);

  if (imgSrc) {
    const image = document.createElement("img");
    image.src = imgSrc;
    image.alt = "icon";
    image.className = "button-img";

    element.appendChild(image);
  }

  if (iconSrc) {
    const image = document.createElement("img");
    image.src = iconSrc;
    image.alt = "icon";
    image.className = "button-icon";

    element.appendChild(image);
  }

  wrapper.appendChild(element);

  return wrapper;
}

function createArchiveDropdownButton(name, link) {
  const dropdown = document.getElementById("archive-dropdown");
  const wrapper = document.createElement("li");
  const a = document.createElement("a");
  a.href = link;
  a.innerText = name;
  wrapper.appendChild(a);
  dropdown.appendChild(wrapper);
}

function modifyDescription(button, description) {
  button.childNodes[0].childNodes[0].childNodes[1].textContent = description;
}

async function getEntries(url) {
  let response = await fetch(url);
  return (await response.text()).split(/\r?\n/).length;
}
