const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Xcode 26's stricter Clang breaks the `fmt` pod's C++20 consteval format-string
// checks (used internally by React Native's C++ core). Forcing just the `fmt`
// pod to compile against C++17 skips that code path entirely and fixes the
// "call to consteval function ... is not a constant expression" build error.
// See: https://github.com/facebook/react-native/issues/55601

const FMT_FIX_MARKER = "target.name == 'fmt'";

const FMT_FIX_SNIPPET = `
    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |bc|
          bc.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end
`;

module.exports = function withFmtCpp17Fix(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');

      if (contents.includes(FMT_FIX_MARKER)) {
        return config;
      }

      const callRegex = /react_native_post_install\([\s\S]*?\n\s*\)\n/;
      const match = contents.match(callRegex);
      if (!match) {
        throw new Error(
          'withFmtCpp17Fix: could not find the react_native_post_install(...) call in Podfile to patch. ' +
            'The Expo Podfile template may have changed — update plugins/withFmtCpp17Fix.js.'
        );
      }

      const insertAt = match.index + match[0].length;
      contents = contents.slice(0, insertAt) + FMT_FIX_SNIPPET + contents.slice(insertAt);
      fs.writeFileSync(podfilePath, contents);

      return config;
    },
  ]);
};
