# Third-party notices

The application source, styles, SVG paths and fictional example text were authored in this project. The numerical example and public problem sources are disclosed in `devpost/scope.md`. The Devpost Learn instruction pack is installed locally and its source/revision is recorded in `devpost/skill-provenance.md`; it is not included in the application archive.

## Browser runtime

The production JavaScript bundle includes the following packages from https://github.com/facebook/react:

| Package | Version | License |
|---|---|---|
| react | 19.2.0 | MIT |
| react-dom | 19.2.0 | MIT |
| scheduler | 0.27.0 | MIT |

These packages include the following license. The installed license files were checked for this distribution.

MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Development tools

Vite 8.3.4 (MIT, https://github.com/vitejs/vite) builds and serves the app. Playwright 1.56.1 (Apache-2.0, https://github.com/microsoft/playwright) provides isolated browser checks and optional local demonstration recording. They and their dependencies are pinned in `package-lock.json`. They are development dependencies and are not shipped as browser runtime libraries. npm packages retain their upstream license files when installed.

No external fonts, stock images, music, customer data or runtime model/API services are bundled.
