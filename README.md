# あと何秒？ カウントダウン

子どもが「分」ではなく「秒」で残り時間を理解できるようにする、シンプルなカウントダウンWebアプリです。

## 使い方
1. `index.html` をブラウザで開く
2. 秒数を入力する（初期値は300秒）
3. 「スタート」を押す
4. 残り30秒ごとに「あと○秒だよ」と音声で知らせます

## GitHub Pagesで公開
1. GitHubで新しいRepositoryを作成する（例：`seconds-countdown`）
2. このフォルダ内の `index.html`、`style.css`、`script.js`、`README.md` をアップロードする
3. Repositoryの **Settings → Pages** を開く
4. **Build and deployment** の Source を **Deploy from a branch** にする
5. Branchを **main**、Folderを **/(root)** にして Save
6. 数分待つと公開URLが表示されます

音声読み上げにはブラウザの日本語音声機能を使います。最初にスタートボタンを押して音声を有効にしてください。
