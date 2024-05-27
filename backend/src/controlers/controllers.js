import asyncHanddler from "../services/asyncHanddler.js"
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const git = simpleGit();

const SONAR_CLOUD_URL = 'https://sonarcloud.io';
const SONAR_TOKEN = 'd6828b10e5fe3444ac08275e3fdc2d1fd6d6e1e9';

async function runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${command}`);
                console.error(stderr);
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    }).catch(error => console.log(error));
}

const fetchSonarResults = async (projectKey) => {
    const response = await fetch(`https://sonarcloud.io/api/issues/search?componentKeys=${projectKey}`, {
        headers: {
            Authorization: `Bearer ${SONAR_TOKEN}`
        }
    });
    const data = await response.json();
    return data;
};

const codeReview = asyncHanddler( async (req, res) => {
    const { repoUrl, organizationKey,
        projectKeyrepositoryUrl  } = req.body;
        console.log(projectKeyrepositoryUrl, organizationKey, repoUrl)
    
        if (!repoUrl) {
            return res.status(400).json({ error: 'Repository URL is required' });
        }
        const backendPath = ''; // Get the absolute path to the backend folder
        const tempPath = path.join('./', 'temp');
    
        // Create the temp directory
        fs.mkdirSync(tempPath, { recursive: true });

        let tempDir = `./temp`
    try {

        // Step 1: Clone the repository
        const repoPath = await git.clone(repoUrl, tempDir);
        console.log(repoPath)
        // Step 2: generate testing files to repository... 
        const sonarProperties = `
            sonar.projectKey=${projectKeyrepositoryUrl}
            sonar.organization=${organizationKey}
            sonar.projectName=${projectKeyrepositoryUrl}
            sonar.projectVersion=1.0
            sonar.sources=.
            sonar.sourceEncoding=UTF-8
            sonar.host.url=${SONAR_CLOUD_URL}
            sonar.token=${SONAR_TOKEN}
        `;
        fs.writeFileSync(`${tempDir}/sonar-project.properties`, sonarProperties.trim());

        // Ensure necessary config files are copied to the tempDir

        const jshintConfig = 'C:/Users/Asus/Desktop/codeReview/backend/.jshintrc'; 
        const eslintConfig = 'C:/Users/Asus/Desktop/codeReview/backend/eslint.config.js'; 

        fs.copyFileSync(eslintConfig, `${tempDir}/eslint.config.js`);
        fs.copyFileSync(jshintConfig, `${tempDir}/.jshintrc`);

        // Step 3: Run static analysis tools
        const eslintCmd = `npx eslint ${tempDir}`;
        const jshintCmd = `npx jshint ${tempDir}`;
        const retireCmd = `npx retire --path ${tempDir} --outputformat json`;
        const snykCmd = `npx snyk test ${tempDir}/${projectKeyrepositoryUrl}`;
        const sonarCmd = `sonar-scanner -D"sonar.projectBaseDir=${tempDir}"`;

        const [eslintResult, jshintResult, retireResult, snykResult] = await Promise.allSettled([
            runCommand(eslintCmd),
            runCommand(jshintCmd),
            runCommand(retireCmd),
            runCommand(snykCmd),
            runCommand(sonarCmd)
        ]);

        const eslintOutput = eslintResult.status === 'fulfilled' ? eslintResult.value.stdout : eslintResult.reason.stderr;
        const jshintOutput = jshintResult.status === 'fulfilled' ? jshintResult.value.stdout : jshintResult.reason.stderr;
        const retireOutput = retireResult.status === 'fulfilled' ? JSON.parse(retireResult.value.stdout) : retireResult.reason.stderr;
        const snykOutput = snykResult.status === 'fulfilled' ? snykResult.value.stdout : snykResult.reason.stderr;
        const sonarResults = await fetchSonarResults(projectKeyrepositoryUrl);

         // Step 4: Aggregate results
         const results = {
            eslint: eslintOutput,
            jshint: jshintOutput,
            retire: retireOutput,
            snyk: snykOutput,
            sonar: sonarResults
        };

        // Step 5: Send the response
        res.json(results);
    } catch (error) {
        console.error(error);
        console.error(error.message);
        
        if (error.message.includes('fatal:')) {
            // Specific handling for git clone errors
            res.status(400).json({ error: 'Invalid repository URL or repository not accessible' });
        } else {
            // Generic error handling
            res.status(500).json({ error: 'Error during code review' });
        }
    } finally {
        console.log('done')
        // Cleanup the temporary directory
        fs.rm(tempPath, { recursive: true });
    }
});

export { codeReview }