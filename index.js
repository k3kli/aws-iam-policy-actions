// https://awspolicygen.s3.amazonaws.com/js/policies.js
const AWS_FILE_URL = 'https://awspolicygen.s3.amazonaws.com/js/policies.js'
const AWS_RESULT_PATH = './result/aws_service_actions.json'
const AWS_TO_DELETE = 'app.PolicyEditorConfig='
const HTTPS = require('https')
const FS = require('fs')
let originalFileStream = FS.createWriteStream('./policies.js')

try {
  HTTPS.get(AWS_FILE_URL, response => {
    let file = ''
    console.log(`Status ${response.statusCode} ${response.statusMessage}!`)
    if (response.statusCode !== 200) {
      throw new Error('Response was not OK!')
    }
    response.pipe(originalFileStream)
    originalFileStream.on('finish', (f) => console.log('Download of file finished!'))
    response.on('data', (d) => { file += d})
    .on('end', () => {
        file = JSON.parse(file.replace(AWS_TO_DELETE, ''))
        for (service of Object.keys(file.serviceMap)) {
            let tmp_actions = {}
            file.serviceMap[service].Actions.forEach(action => {
                tmp_actions[`${action}`] = `${file.serviceMap[service].StringPrefix}:${action}`
            })
            file.serviceMap[service].Actions = tmp_actions
        }
        FS.writeFileSync(AWS_RESULT_PATH, JSON.stringify(file))
        console.log(`File written into ${AWS_RESULT_PATH}!`)
    })
  }).on('error', (e) => {
    console.error(e)
  })
} catch (error) {
  console.error('Could not generate AWS Policy File!')
}