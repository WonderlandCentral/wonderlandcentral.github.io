window.addEventListener('load', async () => {
    fetch('https://wonderland.sigmaclient.cloud/data/credits.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }).then(data => addCreditDate(data))
        .catch(error => {
            console.error('Error fetching credits:', error);
        });
});

function addCreditDate(data) {
    document.getElementById('sources').innerHTML = data["sources"].sort((a, b) => a.localeCompare(b)).join(', ');
    document.getElementById('contributors').innerHTML = data["contributors"].sort((a, b) => a.localeCompare(b)).join(', ');
}
