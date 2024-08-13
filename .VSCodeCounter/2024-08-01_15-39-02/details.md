# Details

Date : 2024-08-01 15:39:02

Directory /Users/sheep/Desktop/web3_projects/zkevm-bridge-ui

Total : 228 files,  32180 codes, 949 comments, 1469 blanks, all 34598 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.dockerignore](/.dockerignore) | Ignore | 10 | 7 | 7 | 24 |
| [.github/CONTIBUTING.md](/.github/CONTIBUTING.md) | Markdown | 14 | 0 | 5 | 19 |
| [.github/ISSUE_TEMPLATE/bug.md](/.github/ISSUE_TEMPLATE/bug.md) | Markdown | 16 | 0 | 8 | 24 |
| [.github/ISSUE_TEMPLATE/config.yml](/.github/ISSUE_TEMPLATE/config.yml) | YAML | 11 | 0 | 1 | 12 |
| [.github/ISSUE_TEMPLATE/feature.md](/.github/ISSUE_TEMPLATE/feature.md) | Markdown | 9 | 5 | 4 | 18 |
| [.github/PULL_REQUEST_TEMPLATE.md](/.github/PULL_REQUEST_TEMPLATE.md) | Markdown | 10 | 2 | 9 | 21 |
| [.github/PULL_REQUEST_TEMPLATE/develop.md](/.github/PULL_REQUEST_TEMPLATE/develop.md) | Markdown | 10 | 2 | 9 | 21 |
| [.github/PULL_REQUEST_TEMPLATE/main.md](/.github/PULL_REQUEST_TEMPLATE/main.md) | Markdown | 6 | 0 | 5 | 11 |
| [.github/workflows/push-docker-develop.yml](/.github/workflows/push-docker-develop.yml) | YAML | 26 | 0 | 6 | 32 |
| [.github/workflows/push-docker-main.yml](/.github/workflows/push-docker-main.yml) | YAML | 26 | 0 | 6 | 32 |
| [.github/workflows/sonarqube.yml](/.github/workflows/sonarqube.yml) | YAML | 17 | 2 | 4 | 23 |
| [.idea/codeStyles/Project.xml](/.idea/codeStyles/Project.xml) | XML | 13 | 0 | 0 | 13 |
| [.idea/codeStyles/codeStyleConfig.xml](/.idea/codeStyles/codeStyleConfig.xml) | XML | 5 | 0 | 0 | 5 |
| [.idea/deployment.xml](/.idea/deployment.xml) | XML | 14 | 0 | 0 | 14 |
| [.idea/inspectionProfiles/Project_Default.xml](/.idea/inspectionProfiles/Project_Default.xml) | XML | 6 | 0 | 0 | 6 |
| [.idea/misc.xml](/.idea/misc.xml) | XML | 6 | 0 | 0 | 6 |
| [.idea/modules.xml](/.idea/modules.xml) | XML | 8 | 0 | 0 | 8 |
| [.idea/sshConfigs.xml](/.idea/sshConfigs.xml) | XML | 8 | 0 | 0 | 8 |
| [.idea/vcs.xml](/.idea/vcs.xml) | XML | 6 | 0 | 0 | 6 |
| [.idea/webServers.xml](/.idea/webServers.xml) | XML | 14 | 0 | 0 | 14 |
| [.idea/zkevm-bridge-ui.iml](/.idea/zkevm-bridge-ui.iml) | XML | 8 | 0 | 0 | 8 |
| [.prettierignore](/.prettierignore) | Ignore | 9 | 2 | 1 | 12 |
| [.prettierrc.json](/.prettierrc.json) | JSON | 4 | 0 | 1 | 5 |
| [Dockerfile](/Dockerfile) | Docker | 10 | 0 | 8 | 18 |
| [README.md](/README.md) | Markdown | 64 | 0 | 24 | 88 |
| [abis/bridge.json](/abis/bridge.json) | JSON | 774 | 0 | 1 | 775 |
| [abis/erc-20.json](/abis/erc-20.json) | JSON | 386 | 0 | 1 | 387 |
| [abis/proof-of-efficiency.json](/abis/proof-of-efficiency.json) | JSON | 1,645 | 0 | 1 | 1,646 |
| [abis/uniswap-v2-pair.json](/abis/uniswap-v2-pair.json) | JSON | 707 | 0 | 1 | 708 |
| [abis/uniswap-v2-router-02.json](/abis/uniswap-v2-router-02.json) | JSON | 953 | 0 | 1 | 954 |
| [deployment/nginx.conf](/deployment/nginx.conf) | Properties | 13 | 1 | 3 | 17 |
| [index.html](/index.html) | HTML | 24 | 0 | 1 | 25 |
| [package-lock.json](/package-lock.json) | JSON | 14,219 | 0 | 1 | 14,220 |
| [package.json](/package.json) | JSON | 82 | 0 | 1 | 83 |
| [public/manifest.json](/public/manifest.json) | JSON | 20 | 0 | 2 | 22 |
| [scripts/generate-contract-types.sh](/scripts/generate-contract-types.sh) | Shell Script | 7 | 5 | 6 | 18 |
| [sonar-project.properties](/sonar-project.properties) | Properties | 1 | 0 | 1 | 2 |
| [src/adapters/bridge-api.ts](/src/adapters/bridge-api.ts) | TypeScript | 217 | 0 | 21 | 238 |
| [src/adapters/browser.ts](/src/adapters/browser.ts) | TypeScript | 5 | 0 | 4 | 9 |
| [src/adapters/env.ts](/src/adapters/env.ts) | TypeScript | 285 | 0 | 26 | 311 |
| [src/adapters/error.ts](/src/adapters/error.ts) | TypeScript | 132 | 4 | 15 | 151 |
| [src/adapters/ethereum.ts](/src/adapters/ethereum.ts) | TypeScript | 334 | 0 | 44 | 378 |
| [src/adapters/fiat-exchange-rates-api.ts](/src/adapters/fiat-exchange-rates-api.ts) | TypeScript | 97 | 0 | 13 | 110 |
| [src/adapters/storage.ts](/src/adapters/storage.ts) | TypeScript | 205 | 6 | 30 | 241 |
| [src/adapters/tokens.ts](/src/adapters/tokens.ts) | TypeScript | 27 | 1 | 4 | 32 |
| [src/assets/background-pattern.svg](/src/assets/background-pattern.svg) | XML | 15 | 0 | 1 | 16 |
| [src/assets/ethereum-erc20-tokens.json](/src/assets/ethereum-erc20-tokens.json) | JSON | 26 | 0 | 1 | 27 |
| [src/assets/ethereum-erc20-tokens.ts](/src/assets/ethereum-erc20-tokens.ts) | TypeScript | 190 | 11 | 3 | 204 |
| [src/assets/icons/arrow-down.svg](/src/assets/icons/arrow-down.svg) | XML | 5 | 0 | 1 | 6 |
| [src/assets/icons/arrow-left.svg](/src/assets/icons/arrow-left.svg) | XML | 5 | 0 | 1 | 6 |
| [src/assets/icons/arrow-right.svg](/src/assets/icons/arrow-right.svg) | XML | 16 | 0 | 1 | 17 |
| [src/assets/icons/caret-down-old.svg](/src/assets/icons/caret-down-old.svg) | XML | 3 | 0 | 1 | 4 |
| [src/assets/icons/caret-down.svg](/src/assets/icons/caret-down.svg) | XML | 19 | 0 | 1 | 20 |
| [src/assets/icons/caret-right.svg](/src/assets/icons/caret-right.svg) | XML | 4 | 0 | 1 | 5 |
| [src/assets/icons/chains/arbitrum.svg](/src/assets/icons/chains/arbitrum.svg) | XML | 20 | 0 | 1 | 21 |
| [src/assets/icons/chains/ethereum.svg](/src/assets/icons/chains/ethereum.svg) | XML | 14 | 0 | 1 | 15 |
| [src/assets/icons/chains/vizing-zkevm.svg](/src/assets/icons/chains/vizing-zkevm.svg) | XML | 10 | 0 | 1 | 11 |
| [src/assets/icons/checkbox-checked.svg](/src/assets/icons/checkbox-checked.svg) | XML | 4 | 0 | 1 | 5 |
| [src/assets/icons/checkbox-unchecked.svg](/src/assets/icons/checkbox-unchecked.svg) | XML | 3 | 0 | 1 | 4 |
| [src/assets/icons/clock.svg](/src/assets/icons/clock.svg) | XML | 4 | 0 | 1 | 5 |
| [src/assets/icons/copy.svg](/src/assets/icons/copy.svg) | XML | 3 | 0 | 1 | 4 |
| [src/assets/icons/currencies/cny.svg](/src/assets/icons/currencies/cny.svg) | XML | 10 | 0 | 1 | 11 |
| [src/assets/icons/currencies/eur.svg](/src/assets/icons/currencies/eur.svg) | XML | 123 | 0 | 1 | 124 |
| [src/assets/icons/currencies/gbp.svg](/src/assets/icons/currencies/gbp.svg) | XML | 9 | 0 | 1 | 10 |
| [src/assets/icons/currencies/jpy.svg](/src/assets/icons/currencies/jpy.svg) | XML | 11 | 0 | 1 | 12 |
| [src/assets/icons/currencies/usd.svg](/src/assets/icons/currencies/usd.svg) | XML | 13 | 0 | 1 | 14 |
| [src/assets/icons/currency-conversion.svg](/src/assets/icons/currency-conversion.svg) | XML | 4 | 0 | 1 | 5 |
| [src/assets/icons/delete.svg](/src/assets/icons/delete.svg) | XML | 3 | 0 | 1 | 4 |
| [src/assets/icons/error.svg](/src/assets/icons/error.svg) | XML | 1 | 0 | 0 | 1 |
| [src/assets/icons/icon-back.svg](/src/assets/icons/icon-back.svg) | XML | 19 | 0 | 1 | 20 |
| [src/assets/icons/info.svg](/src/assets/icons/info.svg) | XML | 3 | 0 | 1 | 4 |
| [src/assets/icons/l1-bridge.svg](/src/assets/icons/l1-bridge.svg) | XML | 6 | 0 | 1 | 7 |
| [src/assets/icons/l2-bridge.svg](/src/assets/icons/l2-bridge.svg) | XML | 6 | 0 | 1 | 7 |
| [src/assets/icons/logout.svg](/src/assets/icons/logout.svg) | XML | 3 | 0 | 1 | 4 |
| [src/assets/icons/magnifying-glass.svg](/src/assets/icons/magnifying-glass.svg) | XML | 3 | 0 | 1 | 4 |
| [src/assets/icons/metamask.svg](/src/assets/icons/metamask.svg) | XML | 60 | 1 | 1 | 62 |
| [src/assets/icons/new-window.svg](/src/assets/icons/new-window.svg) | XML | 4 | 0 | 1 | 5 |
| [src/assets/icons/polygon-hermez.svg](/src/assets/icons/polygon-hermez.svg) | XML | 7 | 0 | 1 | 8 |
| [src/assets/icons/search.svg](/src/assets/icons/search.svg) | XML | 3 | 0 | 1 | 4 |
| [src/assets/icons/setting.svg](/src/assets/icons/setting.svg) | XML | 3 | 0 | 1 | 4 |
| [src/assets/icons/spinner.svg](/src/assets/icons/spinner.svg) | XML | 10 | 0 | 1 | 11 |
| [src/assets/icons/success.svg](/src/assets/icons/success.svg) | XML | 3 | 0 | 1 | 4 |
| [src/assets/icons/tokens/erc20-icon.svg](/src/assets/icons/tokens/erc20-icon.svg) | XML | 9 | 0 | 1 | 10 |
| [src/assets/icons/walletconnect.svg](/src/assets/icons/walletconnect.svg) | XML | 11 | 1 | 0 | 12 |
| [src/assets/icons/warning.svg](/src/assets/icons/warning.svg) | XML | 3 | 0 | 1 | 4 |
| [src/assets/icons/withdraw-pending.svg](/src/assets/icons/withdraw-pending.svg) | XML | 9 | 0 | 1 | 10 |
| [src/assets/icons/withdraw-success.svg](/src/assets/icons/withdraw-success.svg) | XML | 7 | 0 | 1 | 8 |
| [src/assets/icons/xmark.svg](/src/assets/icons/xmark.svg) | XML | 8 | 0 | 1 | 9 |
| [src/assets/vizing-logo-old.svg](/src/assets/vizing-logo-old.svg) | XML | 12 | 0 | 1 | 13 |
| [src/assets/vizing-logo.svg](/src/assets/vizing-logo.svg) | XML | 18 | 0 | 1 | 19 |
| [src/constants.ts](/src/constants.ts) | TypeScript | 167 | 1 | 35 | 203 |
| [src/contexts/bridge.context.tsx](/src/contexts/bridge.context.tsx) | TypeScript JSX | 841 | 0 | 83 | 924 |
| [src/contexts/env.context.tsx](/src/contexts/env.context.tsx) | TypeScript JSX | 51 | 0 | 10 | 61 |
| [src/contexts/error.context.tsx](/src/contexts/error.context.tsx) | TypeScript JSX | 30 | 0 | 12 | 42 |
| [src/contexts/form.context.tsx](/src/contexts/form.context.tsx) | TypeScript JSX | 23 | 0 | 10 | 33 |
| [src/contexts/price-oracle.context.tsx](/src/contexts/price-oracle.context.tsx) | TypeScript JSX | 148 | 0 | 30 | 178 |
| [src/contexts/providers.context.tsx](/src/contexts/providers.context.tsx) | TypeScript JSX | 375 | 31 | 30 | 436 |
| [src/contexts/tokens.context.tsx](/src/contexts/tokens.context.tsx) | TypeScript JSX | 310 | 13 | 33 | 356 |
| [src/contexts/ui.context.tsx](/src/contexts/ui.context.tsx) | TypeScript JSX | 63 | 0 | 14 | 77 |
| [src/domain/index.ts](/src/domain/index.ts) | TypeScript | 294 | 5 | 55 | 354 |
| [src/hooks/use-call-if-mounted.ts](/src/hooks/use-call-if-mounted.ts) | TypeScript | 13 | 0 | 3 | 16 |
| [src/hooks/use-debounce.ts](/src/hooks/use-debounce.ts) | TypeScript | 13 | 0 | 5 | 18 |
| [src/hooks/use-debounced-block.ts](/src/hooks/use-debounced-block.ts) | TypeScript | 22 | 0 | 7 | 29 |
| [src/hooks/use-intersection.ts](/src/hooks/use-intersection.ts) | TypeScript | 21 | 0 | 1 | 22 |
| [src/hooks/use-is-mounted.ts](/src/hooks/use-is-mounted.ts) | TypeScript | 11 | 0 | 5 | 16 |
| [src/main.tsx](/src/main.tsx) | TypeScript JSX | 20 | 0 | 5 | 25 |
| [src/routes.ts](/src/routes.ts) | TypeScript | 51 | 0 | 2 | 53 |
| [src/styles/theme.ts](/src/styles/theme.ts) | TypeScript | 58 | 1 | 2 | 61 |
| [src/utils/addresses.ts](/src/utils/addresses.ts) | TypeScript | 15 | 0 | 7 | 22 |
| [src/utils/amounts.ts](/src/utils/amounts.ts) | TypeScript | 30 | 0 | 6 | 36 |
| [src/utils/browser.ts](/src/utils/browser.ts) | TypeScript | 12 | 0 | 3 | 15 |
| [src/utils/feature-toggles.ts](/src/utils/feature-toggles.ts) | TypeScript | 4 | 0 | 2 | 6 |
| [src/utils/fees.ts](/src/utils/fees.ts) | TypeScript | 44 | 0 | 8 | 52 |
| [src/utils/labels.ts](/src/utils/labels.ts) | TypeScript | 66 | 0 | 6 | 72 |
| [src/utils/serializers.ts](/src/utils/serializers.ts) | TypeScript | 198 | 0 | 25 | 223 |
| [src/utils/time.ts](/src/utils/time.ts) | TypeScript | 39 | 0 | 4 | 43 |
| [src/utils/tokens.ts](/src/utils/tokens.ts) | TypeScript | 11 | 0 | 5 | 16 |
| [src/utils/type-safety.ts](/src/utils/type-safety.ts) | TypeScript | 14 | 1 | 3 | 18 |
| [src/utils/types.ts](/src/utils/types.ts) | TypeScript | 40 | 0 | 6 | 46 |
| [src/views/activity/activity.styles.ts](/src/views/activity/activity.styles.ts) | TypeScript | 104 | 15 | 4 | 123 |
| [src/views/activity/activity.view.tsx](/src/views/activity/activity.view.tsx) | TypeScript JSX | 456 | 5 | 28 | 489 |
| [src/views/activity/components/bridge-card/bridge-card.styles.ts](/src/views/activity/components/bridge-card/bridge-card.styles.ts) | TypeScript | 132 | 5 | 3 | 140 |
| [src/views/activity/components/bridge-card/bridge-card.view.tsx](/src/views/activity/components/bridge-card/bridge-card.view.tsx) | TypeScript JSX | 179 | 136 | 18 | 333 |
| [src/views/activity/components/infinite-scroll/infinite-scroll.styles.ts](/src/views/activity/components/infinite-scroll/infinite-scroll.styles.ts) | TypeScript | 14 | 0 | 3 | 17 |
| [src/views/activity/components/infinite-scroll/infinite-scroll.view.tsx](/src/views/activity/components/infinite-scroll/infinite-scroll.view.tsx) | TypeScript JSX | 55 | 0 | 11 | 66 |
| [src/views/app.styles.ts](/src/views/app.styles.ts) | TypeScript | 77 | 0 | 3 | 80 |
| [src/views/app.view.tsx](/src/views/app.view.tsx) | TypeScript JSX | 35 | 0 | 3 | 38 |
| [src/views/bridge-confirmation/bridge-confirmation.styles.ts](/src/views/bridge-confirmation/bridge-confirmation.styles.ts) | TypeScript | 160 | 0 | 3 | 163 |
| [src/views/bridge-confirmation/bridge-confirmation.view.tsx](/src/views/bridge-confirmation/bridge-confirmation.view.tsx) | TypeScript JSX | 455 | 5 | 32 | 492 |
| [src/views/bridge-confirmation/components/approval-info/approval-info.styles.ts](/src/views/bridge-confirmation/components/approval-info/approval-info.styles.ts) | TypeScript | 9 | 0 | 3 | 12 |
| [src/views/bridge-confirmation/components/approval-info/approval-info.view.tsx](/src/views/bridge-confirmation/components/approval-info/approval-info.view.tsx) | TypeScript JSX | 13 | 0 | 4 | 17 |
| [src/views/bridge-confirmation/components/bridge-button/bridge-button.view.tsx](/src/views/bridge-confirmation/components/bridge-button/bridge-button.view.tsx) | TypeScript JSX | 48 | 0 | 5 | 53 |
| [src/views/bridge-details/bridge-details.styles.ts](/src/views/bridge-details/bridge-details.styles.ts) | TypeScript | 100 | 0 | 3 | 103 |
| [src/views/bridge-details/bridge-details.view.tsx](/src/views/bridge-details/bridge-details.view.tsx) | TypeScript JSX | 377 | 2 | 28 | 407 |
| [src/views/bridge-details/components/chain/chain.styles.ts](/src/views/bridge-details/components/chain/chain.styles.ts) | TypeScript | 7 | 0 | 2 | 9 |
| [src/views/bridge-details/components/chain/chain.tsx](/src/views/bridge-details/components/chain/chain.tsx) | TypeScript JSX | 26 | 0 | 5 | 31 |
| [src/views/core/components/header/header.styles.ts](/src/views/core/components/header/header.styles.ts) | TypeScript | 40 | 8 | 3 | 51 |
| [src/views/core/components/header/header.view.tsx](/src/views/core/components/header/header.view.tsx) | TypeScript JSX | 36 | 0 | 5 | 41 |
| [src/views/core/layout/layout.styles.ts](/src/views/core/layout/layout.styles.ts) | TypeScript | 34 | 0 | 3 | 37 |
| [src/views/core/layout/layout.view.tsx](/src/views/core/layout/layout.view.tsx) | TypeScript JSX | 70 | 2 | 6 | 78 |
| [src/views/core/router/router.view.tsx](/src/views/core/router/router.view.tsx) | TypeScript JSX | 53 | 17 | 7 | 77 |
| [src/views/home/components/amount-input/amount-input.styles.ts](/src/views/home/components/amount-input/amount-input.styles.ts) | TypeScript | 37 | 7 | 3 | 47 |
| [src/views/home/components/amount-input/amount-input.view.tsx](/src/views/home/components/amount-input/amount-input.view.tsx) | TypeScript JSX | 68 | 1 | 11 | 80 |
| [src/views/home/components/bridge-deposit-form/bridge-deposit-form.styles.ts](/src/views/home/components/bridge-deposit-form/bridge-deposit-form.styles.ts) | TypeScript | 154 | 31 | 3 | 188 |
| [src/views/home/components/bridge-deposit-form/bridge-deposit-form.view.tsx](/src/views/home/components/bridge-deposit-form/bridge-deposit-form.view.tsx) | TypeScript JSX | 420 | 50 | 35 | 505 |
| [src/views/home/components/bridge-form/bridge-form.styles.ts](/src/views/home/components/bridge-form/bridge-form.styles.ts) | TypeScript | 35 | 125 | 3 | 163 |
| [src/views/home/components/bridge-form/bridge-form.view.tsx](/src/views/home/components/bridge-form/bridge-form.view.tsx) | TypeScript JSX | 232 | 113 | 34 | 379 |
| [src/views/home/components/bridge-gas-fee/bridge-gas-fee.styles.ts](/src/views/home/components/bridge-gas-fee/bridge-gas-fee.styles.ts) | TypeScript | 37 | 0 | 3 | 40 |
| [src/views/home/components/bridge-gas-fee/bridge-gas-fee.view.tsx](/src/views/home/components/bridge-gas-fee/bridge-gas-fee.view.tsx) | TypeScript JSX | 424 | 158 | 51 | 633 |
| [src/views/home/components/bridge-withdraw-form/bridge-withdraw-form.styles.ts](/src/views/home/components/bridge-withdraw-form/bridge-withdraw-form.styles.ts) | TypeScript | 139 | 24 | 3 | 166 |
| [src/views/home/components/bridge-withdraw-form/bridge-withdraw-form.view.tsx](/src/views/home/components/bridge-withdraw-form/bridge-withdraw-form.view.tsx) | TypeScript JSX | 346 | 29 | 30 | 405 |
| [src/views/home/components/deposit-warning-modal/deposit-warning-modal.styles.ts](/src/views/home/components/deposit-warning-modal/deposit-warning-modal.styles.ts) | TypeScript | 65 | 0 | 3 | 68 |
| [src/views/home/components/deposit-warning-modal/deposit-warning-modal.view.tsx](/src/views/home/components/deposit-warning-modal/deposit-warning-modal.view.tsx) | TypeScript JSX | 56 | 0 | 5 | 61 |
| [src/views/home/components/header/header.styles.ts](/src/views/home/components/header/header.styles.ts) | TypeScript | 45 | 0 | 3 | 48 |
| [src/views/home/components/header/header.view.tsx](/src/views/home/components/header/header.view.tsx) | TypeScript JSX | 41 | 0 | 5 | 46 |
| [src/views/home/components/max-button/max-button.styles.ts](/src/views/home/components/max-button/max-button.styles.ts) | TypeScript | 37 | 7 | 3 | 47 |
| [src/views/home/components/max-button/max-button.view.tsx](/src/views/home/components/max-button/max-button.view.tsx) | TypeScript JSX | 61 | 1 | 11 | 73 |
| [src/views/home/components/pending-list-card/pending-list-card.styles.ts](/src/views/home/components/pending-list-card/pending-list-card.styles.ts) | TypeScript | 127 | 1 | 3 | 131 |
| [src/views/home/components/pending-list-card/pending-list-card.view.tsx](/src/views/home/components/pending-list-card/pending-list-card.view.tsx) | TypeScript JSX | 72 | 5 | 8 | 85 |
| [src/views/home/components/pending-list/pending-list.styles.ts](/src/views/home/components/pending-list/pending-list.styles.ts) | TypeScript | 25 | 1 | 3 | 29 |
| [src/views/home/components/pending-list/pending-list.view.tsx](/src/views/home/components/pending-list/pending-list.view.tsx) | TypeScript JSX | 35 | 0 | 5 | 40 |
| [src/views/home/components/pending-status-icon/pending-status-icon.styles.ts](/src/views/home/components/pending-status-icon/pending-status-icon.styles.ts) | TypeScript | 30 | 0 | 3 | 33 |
| [src/views/home/components/pending-status-icon/pending-status-icon.view.tsx](/src/views/home/components/pending-status-icon/pending-status-icon.view.tsx) | TypeScript JSX | 26 | 0 | 5 | 31 |
| [src/views/home/components/text-match-form/text-match-form.styles.ts](/src/views/home/components/text-match-form/text-match-form.styles.ts) | TypeScript | 41 | 0 | 3 | 44 |
| [src/views/home/components/text-match-form/text-match-form.view.tsx](/src/views/home/components/text-match-form/text-match-form.view.tsx) | TypeScript JSX | 45 | 0 | 5 | 50 |
| [src/views/home/components/token-adder/token-adder.styles.ts](/src/views/home/components/token-adder/token-adder.styles.ts) | TypeScript | 41 | 0 | 3 | 44 |
| [src/views/home/components/token-adder/token-adder.view.tsx](/src/views/home/components/token-adder/token-adder.view.tsx) | TypeScript JSX | 36 | 0 | 5 | 41 |
| [src/views/home/components/token-info-table/token-info-table.styles.ts](/src/views/home/components/token-info-table/token-info-table.styles.ts) | TypeScript | 67 | 0 | 3 | 70 |
| [src/views/home/components/token-info-table/token-info-table.view.tsx](/src/views/home/components/token-info-table/token-info-table.view.tsx) | TypeScript JSX | 164 | 0 | 17 | 181 |
| [src/views/home/components/token-info/token-info.styles.ts](/src/views/home/components/token-info/token-info.styles.ts) | TypeScript | 30 | 0 | 3 | 33 |
| [src/views/home/components/token-info/token-info.view.tsx](/src/views/home/components/token-info/token-info.view.tsx) | TypeScript JSX | 36 | 0 | 6 | 42 |
| [src/views/home/components/token-list/token-list.styles.ts](/src/views/home/components/token-list/token-list.styles.ts) | TypeScript | 150 | 3 | 3 | 156 |
| [src/views/home/components/token-list/token-list.view.tsx](/src/views/home/components/token-list/token-list.view.tsx) | TypeScript JSX | 233 | 25 | 18 | 276 |
| [src/views/home/components/token-selector-header/token-selector-header.styles.ts](/src/views/home/components/token-selector-header/token-selector-header.styles.ts) | TypeScript | 55 | 1 | 3 | 59 |
| [src/views/home/components/token-selector-header/token-selector-header.view.tsx](/src/views/home/components/token-selector-header/token-selector-header.view.tsx) | TypeScript JSX | 30 | 0 | 5 | 35 |
| [src/views/home/components/token-selector/token-selector.styles.ts](/src/views/home/components/token-selector/token-selector.styles.ts) | TypeScript | 22 | 0 | 3 | 25 |
| [src/views/home/components/token-selector/token-selector.view.tsx](/src/views/home/components/token-selector/token-selector.view.tsx) | TypeScript JSX | 138 | 0 | 17 | 155 |
| [src/views/home/home.styles.ts](/src/views/home/home.styles.ts) | TypeScript | 67 | 1 | 3 | 71 |
| [src/views/home/home.view.tsx](/src/views/home/home.view.tsx) | TypeScript JSX | 113 | 24 | 11 | 148 |
| [src/views/login/components/wallet-icon/wallet-icon.styles.ts](/src/views/login/components/wallet-icon/wallet-icon.styles.ts) | TypeScript | 22 | 0 | 4 | 26 |
| [src/views/login/components/wallet-icon/wallet-icon.view.tsx](/src/views/login/components/wallet-icon/wallet-icon.view.tsx) | TypeScript JSX | 29 | 0 | 5 | 34 |
| [src/views/login/components/wallet-list/wallet-list.styles.ts](/src/views/login/components/wallet-list/wallet-list.styles.ts) | TypeScript | 29 | 0 | 3 | 32 |
| [src/views/login/components/wallet-list/wallet-list.view.tsx](/src/views/login/components/wallet-list/wallet-list.view.tsx) | TypeScript JSX | 30 | 0 | 5 | 35 |
| [src/views/login/login.styles.ts](/src/views/login/login.styles.ts) | TypeScript | 49 | 0 | 3 | 52 |
| [src/views/login/login.view.tsx](/src/views/login/login.view.tsx) | TypeScript JSX | 101 | 0 | 10 | 111 |
| [src/views/network-error/network-error.styles.ts](/src/views/network-error/network-error.styles.ts) | TypeScript | 38 | 0 | 3 | 41 |
| [src/views/network-error/network-error.view.tsx](/src/views/network-error/network-error.view.tsx) | TypeScript JSX | 40 | 0 | 6 | 46 |
| [src/views/settings/settings.styles.ts](/src/views/settings/settings.styles.ts) | TypeScript | 60 | 0 | 3 | 63 |
| [src/views/settings/settings.view.tsx](/src/views/settings/settings.view.tsx) | TypeScript JSX | 76 | 0 | 6 | 82 |
| [src/views/shared/button/button.styles.ts](/src/views/shared/button/button.styles.ts) | TypeScript | 29 | 0 | 3 | 32 |
| [src/views/shared/button/button.view.tsx](/src/views/shared/button/button.view.tsx) | TypeScript JSX | 28 | 0 | 5 | 33 |
| [src/views/shared/card/card.styles.ts](/src/views/shared/card/card.styles.ts) | TypeScript | 9 | 0 | 3 | 12 |
| [src/views/shared/card/card.view.tsx](/src/views/shared/card/card.view.tsx) | TypeScript JSX | 14 | 0 | 5 | 19 |
| [src/views/shared/chain-list/chain-list.styles.ts](/src/views/shared/chain-list/chain-list.styles.ts) | TypeScript | 94 | 3 | 3 | 100 |
| [src/views/shared/chain-list/chain-list.view.tsx](/src/views/shared/chain-list/chain-list.view.tsx) | TypeScript JSX | 40 | 3 | 6 | 49 |
| [src/views/shared/confirmation-modal/confirmation-modal.styles.ts](/src/views/shared/confirmation-modal/confirmation-modal.styles.ts) | TypeScript | 50 | 0 | 3 | 53 |
| [src/views/shared/confirmation-modal/confirmation-modal.view.tsx](/src/views/shared/confirmation-modal/confirmation-modal.view.tsx) | TypeScript JSX | 47 | 0 | 6 | 53 |
| [src/views/shared/error-message/error-message.styles.ts](/src/views/shared/error-message/error-message.styles.ts) | TypeScript | 13 | 0 | 3 | 16 |
| [src/views/shared/error-message/error-message.view.tsx](/src/views/shared/error-message/error-message.view.tsx) | TypeScript JSX | 16 | 0 | 5 | 21 |
| [src/views/shared/external-link/external-link.styles.ts](/src/views/shared/external-link/external-link.styles.ts) | TypeScript | 11 | 0 | 3 | 14 |
| [src/views/shared/external-link/external-link.view.tsx](/src/views/shared/external-link/external-link.view.tsx) | TypeScript JSX | 13 | 0 | 5 | 18 |
| [src/views/shared/header/header.styles.ts](/src/views/shared/header/header.styles.ts) | TypeScript | 63 | 0 | 3 | 66 |
| [src/views/shared/header/header.view.tsx](/src/views/shared/header/header.view.tsx) | TypeScript JSX | 35 | 0 | 5 | 40 |
| [src/views/shared/icon/icon.styles.ts](/src/views/shared/icon/icon.styles.ts) | TypeScript | 14 | 0 | 2 | 16 |
| [src/views/shared/icon/icon.view.tsx](/src/views/shared/icon/icon.view.tsx) | TypeScript JSX | 18 | 0 | 5 | 23 |
| [src/views/shared/info-banner/info-banner.styles.ts](/src/views/shared/info-banner/info-banner.styles.ts) | TypeScript | 16 | 0 | 3 | 19 |
| [src/views/shared/info-banner/info-banner.view.tsx](/src/views/shared/info-banner/info-banner.view.tsx) | TypeScript JSX | 19 | 0 | 5 | 24 |
| [src/views/shared/network-box/network-box.styles.ts](/src/views/shared/network-box/network-box.styles.ts) | TypeScript | 49 | 0 | 3 | 52 |
| [src/views/shared/network-box/network-box.view.tsx](/src/views/shared/network-box/network-box.view.tsx) | TypeScript JSX | 112 | 30 | 7 | 149 |
| [src/views/shared/network-selector/network-selector.styles.ts](/src/views/shared/network-selector/network-selector.styles.ts) | TypeScript | 37 | 3 | 3 | 43 |
| [src/views/shared/network-selector/network-selector.view.tsx](/src/views/shared/network-selector/network-selector.view.tsx) | TypeScript JSX | 69 | 0 | 7 | 76 |
| [src/views/shared/page-loader/page-loader.styles.ts](/src/views/shared/page-loader/page-loader.styles.ts) | TypeScript | 10 | 0 | 2 | 12 |
| [src/views/shared/page-loader/page-loader.view.tsx](/src/views/shared/page-loader/page-loader.view.tsx) | TypeScript JSX | 11 | 0 | 3 | 14 |
| [src/views/shared/portal/portal.styles.ts](/src/views/shared/portal/portal.styles.ts) | TypeScript | 10 | 0 | 2 | 12 |
| [src/views/shared/portal/portal.view.tsx](/src/views/shared/portal/portal.view.tsx) | TypeScript JSX | 18 | 0 | 7 | 25 |
| [src/views/shared/private-route/private-route.view.tsx](/src/views/shared/private-route/private-route.view.tsx) | TypeScript JSX | 24 | 0 | 4 | 28 |
| [src/views/shared/snackbar/snackbar.styles.ts](/src/views/shared/snackbar/snackbar.styles.ts) | TypeScript | 67 | 0 | 3 | 70 |
| [src/views/shared/snackbar/snackbar.view.tsx](/src/views/shared/snackbar/snackbar.view.tsx) | TypeScript JSX | 70 | 0 | 8 | 78 |
| [src/views/shared/spinner/spinner.styles.ts](/src/views/shared/spinner/spinner.styles.ts) | TypeScript | 30 | 0 | 4 | 34 |
| [src/views/shared/spinner/spinner.view.tsx](/src/views/shared/spinner/spinner.view.tsx) | TypeScript JSX | 32 | 0 | 5 | 37 |
| [src/views/shared/token-balance/token-balance.styles.ts](/src/views/shared/token-balance/token-balance.styles.ts) | TypeScript | 13 | 0 | 3 | 16 |
| [src/views/shared/token-balance/token-balance.view.tsx](/src/views/shared/token-balance/token-balance.view.tsx) | TypeScript JSX | 45 | 0 | 7 | 52 |
| [src/views/shared/typography/typography.styles.ts](/src/views/shared/typography/typography.styles.ts) | TypeScript | 48 | 0 | 3 | 51 |
| [src/views/shared/typography/typography.view.tsx](/src/views/shared/typography/typography.view.tsx) | TypeScript JSX | 11 | 0 | 5 | 16 |
| [src/vite-env.d.ts](/src/vite-env.d.ts) | TypeScript | 26 | 5 | 8 | 39 |
| [tsconfig.json](/tsconfig.json) | JSON with Comments | 26 | 0 | 1 | 27 |
| [tsconfig.node.json](/tsconfig.node.json) | JSON | 10 | 0 | 1 | 11 |
| [vite.config.ts](/vite.config.ts) | TypeScript | 30 | 1 | 2 | 33 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)