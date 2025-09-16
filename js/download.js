function updateScroll() {
    const container = document.getElementById("box-container")
    if (container.scrollHeight > container.clientHeight) {
        container.classList.remove("center")
        container.classList.add("scroll")
    } else {
        container.classList.add("center")
        container.classList.remove("scroll")
    }
}

window.addEventListener("resize", updateScroll);


let source = "";

window.addEventListener('load', async () => {
    const params = new URLSearchParams(window.location.search);
    const files = decodeURIComponent(params.get('files') || '');
    source = decodeURIComponent(params.get('source') || '');

    if (!files)
        return;

    const filesDecoded = JSON.parse(atob(files));

    for (const fileObject of filesDecoded) {
        if (!fileObject.url.startsWith('download.php') && !fileObject.url.startsWith('v2/download.php'))
            return;

        const boxDiv = document.createElement('div');
        boxDiv.className = 'box';

        const fileDataDiv = document.createElement('div');
        fileDataDiv.className = 'file-data';

        const name = document.createElement('p');
        name.className = 'title';
        name.textContent = fileObject.name;

        const dateUploaded = document.createElement('p');
        dateUploaded.className = 'sub';
        dateUploaded.textContent = "Date uploaded: " + formatEpochTime(fileObject.dateUploaded);

        const hash = document.createElement('p');
        hash.className = 'sub';
        hash.textContent = "MD5: " + fileObject.md5;

        fileDataDiv.append(name, dateUploaded, hash);

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons';

        const downloadButtonWrapper = document.createElement('a');
        const downloadButton = document.createElement('button');
        downloadButton.innerText = "Download";
        downloadButtonWrapper.href = "https://wonderland.sigmaclient.cloud/" + fileObject.url;
        downloadButtonWrapper.appendChild(downloadButton);

        buttonsDiv.appendChild(downloadButtonWrapper);

        if (source) {
            const shareButtonWrapper = document.createElement('a');
            const shareButton = document.createElement('button');
            shareButton.innerText = "Share";
            shareButtonWrapper.href = "javascript:share()"
            shareButtonWrapper.appendChild(shareButton);
            buttonsDiv.appendChild(shareButtonWrapper);
        }

        boxDiv.append(fileDataDiv, buttonsDiv);

        document.getElementById("box-container").appendChild(boxDiv);
    }

    updateScroll()
});

function share() {
    navigator.clipboard.writeText(encodeURI("https://wonderland.sigmaclient.cloud/" + (source.startsWith("/") ? source.substring(1) : source))).then(function() {
        window.alert('URL copied to clipboard!');
    }, function(err) {
        console.error('Failed to copy URL to clipboard! ', err);
    });
}

function formatEpochTime(epochTime, format = 'short') {
    const date = new Date(epochTime * 1000);

    const userLocale = navigator.language || 'en_GB';
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = {
        timeZone: userTimeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    };

    if (format === 'short') {
        options.year = '2-digit';
        options.month = '2-digit';
        options.day = '2-digit';
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
    } else if (format === 'long') {
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        options.hour = 'numeric';
        options.minute = 'numeric';
        options.second = 'numeric';
    } else if (format === 'full') {
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        options.weekday = 'long';
        options.hour = 'numeric';
        options.minute = 'numeric';
        options.second = 'numeric';
    }

    const formatter = new Intl.DateTimeFormat(userLocale, options);

    return formatter.format(date);
}