function checkLink() {
    const linkInput = document.getElementById('linkInput').value;
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');

    // Show loading indicator
    loadingDiv.style.display = 'flex';
    resultDiv.innerHTML = '';

    // Using AllOrigins as a CORS proxy
    const allOriginsUrl = 'https://api.allorigins.win/get?callback=myFunc&url=';
    const apiUrl = allOriginsUrl + encodeURIComponent(linkInput);

    fetch(apiUrl)
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Fail! The link is not valid.');
            }
        })
        .then(data => {
            // Check if the response indicates a 404 Not Found
            if (data.includes('"http_code":404')) {
                throw new Error('Fail!');
            } else {
                resultDiv.innerHTML = '<p style="color: green;">Success!</p>';
            }
        })
        .catch(error => {
            resultDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
        })
        .finally(() => {
            // Hide loading indicator after processing
            loadingDiv.style.display = 'none';
        });
}