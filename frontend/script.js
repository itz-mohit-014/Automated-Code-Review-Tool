const organizationKey = 'itz-mohit-014';

document
  .getElementById("codeReviewForm")
  .addEventListener("submit", codeReview);

async function codeReview(event) {
  event.preventDefault();

  const repoUrl = document.getElementById("repositoryUrl").value;
  const projectKeyrepositoryUrl = repoUrl.split('https://github.com/')[1].split('/')[1].split('.git')[0]

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = ` <div class="loader">
  <span></span>
</div>`
  try {
    const response = await fetch("http://localhost:3000/api/v1/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        repoUrl, 
        organizationKey,
        projectKeyrepositoryUrl: projectKeyrepositoryUrl }),
    });

    if (response.ok) {
      var term = new Terminal();
      term.open(document.getElementById('terminal'));
      term.write('npx eslint ../backend/temp')
      const data = await response.json();
      resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } else {
      const error = await response.json();
      resultDiv.innerHTML = `Error: ${error.message}`;
    }
  } catch (error) {
    resultDiv.innerHTML = `Error: ${error.message}`;
  }
}