pipeline {
  agent any
  tools {nodejs "node"}
    stages {
      stage('build') {
      steps {
        sh 'node -v && npm -v'
        sh 'npm install'
        sh 'npm run build'
        sh 'pwd'
        sh 'echo $BRANCH_NAME'
        withCredentials([usernamePassword(credentialsId: 'sshuserLsgFE', passwordVariable: 'passWord', usernameVariable: 'userName')]) {
          sh 'sshpass -p $passWord ssh -o StrictHostKeyChecking=no -p 9022 $userName@10.100.128.12 "mkdir -p /usr/local/apache2/htdocs/czhdev/develop-biometrie &&  rm -rf /usr/local/apache2/htdocs/czhdev/develop-biometrie/"'
        }
        withCredentials([usernamePassword(credentialsId: 'sshuserLsgFE', passwordVariable: 'passWord', usernameVariable: 'userName')]) {
          sh 'sshpass -p $passWord scp -o StrictHostKeyChecking=no -P 9022 -r dist/ci/dev/ $userName@10.100.128.12:/usr/local/apache2/htdocs/czhdev/develop-biometrie/'
        }
      }
    }
  }
}
