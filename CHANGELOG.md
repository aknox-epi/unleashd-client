# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.5.0](https://github.com/aknox-epi/unleashd-client/compare/v0.3.0...v0.5.0) (2025-12-15)

### Features

- automate dev→main PR creation for releases ([#40](https://github.com/aknox-epi/unleashd-client/issues/40)) ([2b49f47](https://github.com/aknox-epi/unleashd-client/commit/2b49f479f04548e5890df906cf59045a85aa3510))
- implement automated git tagging for production releases ([#41](https://github.com/aknox-epi/unleashd-client/issues/41)) ([091b67e](https://github.com/aknox-epi/unleashd-client/commit/091b67e984662a02198d48871e01ffb3aac30557))
- simplify release workflow and fix tag management ([#42](https://github.com/aknox-epi/unleashd-client/issues/42)) ([28fef61](https://github.com/aknox-epi/unleashd-client/commit/28fef615bb55763470fa73698fdc85f826da3e1d))
- **ui:** standardize max-width across all tab screens ([ca563f9](https://github.com/aknox-epi/unleashd-client/commit/ca563f9a03c822910e808e18597b58adec275975))

## [0.4.0](https://github.com/aknox-epi/unleashd-client/compare/v0.3.0...v0.4.0) (2025-12-12)

### Features

- automate dev→main PR creation for releases ([#40](https://github.com/aknox-epi/unleashd-client/issues/40)) ([2b49f47](https://github.com/aknox-epi/unleashd-client/commit/2b49f479f04548e5890df906cf59045a85aa3510))
- implement automated git tagging for production releases ([#41](https://github.com/aknox-epi/unleashd-client/issues/41)) ([091b67e](https://github.com/aknox-epi/unleashd-client/commit/091b67e984662a02198d48871e01ffb3aac30557))
- simplify release workflow and fix tag management ([#42](https://github.com/aknox-epi/unleashd-client/issues/42)) ([28fef61](https://github.com/aknox-epi/unleashd-client/commit/28fef615bb55763470fa73698fdc85f826da3e1d))

## [0.3.1](https://github.com/aknox-epi/unleashd-client/compare/v0.3.0...v0.3.1) (2025-12-12)

## [0.3.0](https://github.com/aknox-epi/unleashd-client/compare/v0.2.0...v0.3.0) (2025-12-12)

### Features

- **location:** display distance from search location on animal cards ([#25](https://github.com/aknox-epi/unleashd-client/issues/25)) ([391eab8](https://github.com/aknox-epi/unleashd-client/commit/391eab8a8343e4486edad759673a39d877139344))

### Bug Fixes

- **a11y:** resolve aria-hidden focus issue in fullscreen image modal ([#23](https://github.com/aknox-epi/unleashd-client/issues/23)) ([400cc4c](https://github.com/aknox-epi/unleashd-client/commit/400cc4c32f243de95add7ccc9c81773de0560044))
- **organizations:** use publicSearch action instead of publicView ([#27](https://github.com/aknox-epi/unleashd-client/issues/27)) ([6747ce7](https://github.com/aknox-epi/unleashd-client/commit/6747ce76eac34ece61e4aab6a468bafc31ebd0d5))
- **pet-detail:** require street address for Get Directions link ([#28](https://github.com/aknox-epi/unleashd-client/issues/28)) ([9ab677e](https://github.com/aknox-epi/unleashd-client/commit/9ab677eeee3e9c17179c8f2f6a99cc4362d0fd7b))
- **settings:** ensure What's New badge disappears when drawer closes ([#31](https://github.com/aknox-epi/unleashd-client/issues/31)) ([cd1f4d4](https://github.com/aknox-epi/unleashd-client/commit/cd1f4d4f48384948e3faf209c015045971efd8ad))
- **whats-new:** fix double-press bug and Fix two critical issues with the What's New feature ([#20](https://github.com/aknox-epi/unleashd-client/issues/20)) ([aa2f10b](https://github.com/aknox-epi/unleashd-client/commit/aa2f10b9d4c9c82fdd15b8924cb55878acf7852b)), closes [#1](https://github.com/aknox-epi/unleashd-client/issues/1) [#2](https://github.com/aknox-epi/unleashd-client/issues/2)

### Documentation

- update roadmap with testing improvements ([#30](https://github.com/aknox-epi/unleashd-client/issues/30)) ([f47abf5](https://github.com/aknox-epi/unleashd-client/commit/f47abf5f2394bb98c4cbffe07e040b91e1e3824f))
- update ROADMAP.md to reflect v0.2.0 achievements ([#15](https://github.com/aknox-epi/unleashd-client/issues/15)) ([dc63bd6](https://github.com/aknox-epi/unleashd-client/commit/dc63bd6562cd1c0d6dcb86d9da6e52f850484419)), closes [#5](https://github.com/aknox-epi/unleashd-client/issues/5) [-#14](https://github.com/aknox-epi/-/issues/14)

## 0.2.0 (2025-11-15)

### Features

- add pet search with infinite scroll to explore tab ([#8](https://github.com/aknox-epi/unleashd-client/issues/8)) ([0193552](https://github.com/aknox-epi/unleashd-client/commit/0193552cde457e16a0bf985cab1fecb460faecfe))
- default theme to system preference on first launch ([#7](https://github.com/aknox-epi/unleashd-client/issues/7)) ([b84f131](https://github.com/aknox-epi/unleashd-client/commit/b84f131ec2a10db8d672b6b3d298ca2eaa251fb6))
- **pet-detail:** add fullscreen image modal and species-specific badge colors ([#11](https://github.com/aknox-epi/unleashd-client/issues/11)) ([d5a89db](https://github.com/aknox-epi/unleashd-client/commit/d5a89db6fc4028700371fa1c7330cb10a9f35ab5))
- **pet-detail:** add pet detail screen with theme support and proper text rendering ([#9](https://github.com/aknox-epi/unleashd-client/issues/9)) ([f0b4a1c](https://github.com/aknox-epi/unleashd-client/commit/f0b4a1c73ebcdb4d07079b262e300e3785e19d77))
- **pet-detail:** add photo gallery and adoption fee formatting ([#10](https://github.com/aknox-epi/unleashd-client/issues/10)) ([399b493](https://github.com/aknox-epi/unleashd-client/commit/399b493b2a01dde5192dd28f44a78f04665b0287))

### Documentation

- add comprehensive README.md ([#1](https://github.com/aknox-epi/unleashd-client/issues/1)) ([1466f9d](https://github.com/aknox-epi/unleashd-client/commit/1466f9da3be6d06b8d16771d0fdcd9b5ee31da48))
- update AGENTS.md with pre-commit hook information ([5a105e7](https://github.com/aknox-epi/unleashd-client/commit/5a105e7e0f089fdec2c348f301997abaa2e30bfd))

### Build System

- add changelog automation and agent workflow documentation ([778d8a5](https://github.com/aknox-epi/unleashd-client/commit/778d8a52d73246ec513c6fde27c435aec5fbf8ff))
- add commitlint with conventional commits validation ([bd0612e](https://github.com/aknox-epi/unleashd-client/commit/bd0612e74abaa9c99937cac34f15b8eb1583065d))
- add GitHub Flow workflow with CI/CD pipeline ([faa9fb6](https://github.com/aknox-epi/unleashd-client/commit/faa9fb681ca9c25992501f309bb677ed0f6d8fdf))

## 0.1.3 (2025-11-12)

### Features

- add settings tab with theme switcher ([3c0beee](https://github.com/aknox-epi/unleashd-client/commit/3c0beeee400b81eb9f481d8b8561743c124717b9))

### Documentation

- add comprehensive README.md ([#1](https://github.com/aknox-epi/unleashd-client/issues/1)) ([1466f9d](https://github.com/aknox-epi/unleashd-client/commit/1466f9da3be6d06b8d16771d0fdcd9b5ee31da48))
- update AGENTS.md with pre-commit hook information ([5a105e7](https://github.com/aknox-epi/unleashd-client/commit/5a105e7e0f089fdec2c348f301997abaa2e30bfd))

### Build System

- add changelog automation and agent workflow documentation ([778d8a5](https://github.com/aknox-epi/unleashd-client/commit/778d8a52d73246ec513c6fde27c435aec5fbf8ff))
- add commitlint with conventional commits validation ([bd0612e](https://github.com/aknox-epi/unleashd-client/commit/bd0612e74abaa9c99937cac34f15b8eb1583065d))
- add GitHub Flow workflow with CI/CD pipeline ([faa9fb6](https://github.com/aknox-epi/unleashd-client/commit/faa9fb681ca9c25992501f309bb677ed0f6d8fdf))

## 0.1.2 (2025-11-12)

### Features

- add animal images and optimize API field requests ([21a4146](https://github.com/aknox-epi/unleashd-client/commit/21a4146dcfde3dc49057f5e561c4ba6bd0bc9716))
- add auto-generated TypeScript types for RescueGroups API fields ([1faddfb](https://github.com/aknox-epi/unleashd-client/commit/1faddfbcb742b3f5e60f5aa907d14407cc5b51ba))
- add environment-aware warning and error display system ([58e7b10](https://github.com/aknox-epi/unleashd-client/commit/58e7b10a7fc41ff3dc60ab4346eea2763f6cd013))
- add React Context and hooks for RescueGroups API integration ([228119a](https://github.com/aknox-epi/unleashd-client/commit/228119a7763895a8106e7895548710610612a884))
- add RescueGroups API configuration and environment setup ([e6ddac4](https://github.com/aknox-epi/unleashd-client/commit/e6ddac4619ec7138b6e9a9c337c9d5c4d9741fa5))
- add RescueGroups API health status indicator to Tab 2 ([337b2fb](https://github.com/aknox-epi/unleashd-client/commit/337b2fb469017cc72126b70c11b47f82217c475d))
- **context:** integrate service health tracking ([440b83b](https://github.com/aknox-epi/unleashd-client/commit/440b83b83436c48d4389fcf521bf6ac8f7b4d910))
- implement RescueGroups API service layer ([3d8de6e](https://github.com/aknox-epi/unleashd-client/commit/3d8de6eb63bd5ce17ea7fd4e99b3715a21f64b7d))
- **rescuegroups:** add environment-aware error handling ([6b24bb4](https://github.com/aknox-epi/unleashd-client/commit/6b24bb419d04e7274332fd78be5750dd2317b08e))
- **rescuegroups:** add health check and service status monitoring ([1da40df](https://github.com/aknox-epi/unleashd-client/commit/1da40df8d326ec587dc1bea2e2b6b5eb61cde62a))

### Bug Fixes

- ensure environment validation runs before builds ([3c8c84b](https://github.com/aknox-epi/unleashd-client/commit/3c8c84ba4819f0c53a3eb5a921815dd79b8d35b6))
- **rescuegroups:** correct API filter processing and remove unused species map ([7158595](https://github.com/aknox-epi/unleashd-client/commit/7158595a4c030353ecc506a4d640149e781081bb))
- use lowercase species values for API compatibility ([e9a006c](https://github.com/aknox-epi/unleashd-client/commit/e9a006c1c75ec7bcf265b29a9572f951d67b89ad))

### Documentation

- add comprehensive README.md ([#1](https://github.com/aknox-epi/unleashd-client/issues/1)) ([1466f9d](https://github.com/aknox-epi/unleashd-client/commit/1466f9da3be6d06b8d16771d0fdcd9b5ee31da48))
- add comprehensive RescueGroups API animal field documentation ([6204ddf](https://github.com/aknox-epi/unleashd-client/commit/6204ddf2b9264e02de5556bd01875bf75ccb672d))
- add RescueGroups API integration documentation ([eab145e](https://github.com/aknox-epi/unleashd-client/commit/eab145e05e57eef8b086a6c90806a2659c5e2e73))
- document automated testing hooks and coverage standards ([58bfc81](https://github.com/aknox-epi/unleashd-client/commit/58bfc81fc1eeeafb1bbd1be6fffcb0632f59d4e6))
- enforce strict no-commit policy for agents in all modes ([52121d6](https://github.com/aknox-epi/unleashd-client/commit/52121d6055b5b8e9d1ac8dd588bc80b480619331))
- update AGENTS.md with pre-commit hook information ([5a105e7](https://github.com/aknox-epi/unleashd-client/commit/5a105e7e0f089fdec2c348f301997abaa2e30bfd))

### Build System

- add changelog automation and agent workflow documentation ([778d8a5](https://github.com/aknox-epi/unleashd-client/commit/778d8a52d73246ec513c6fde27c435aec5fbf8ff))
- add commitlint with conventional commits validation ([bd0612e](https://github.com/aknox-epi/unleashd-client/commit/bd0612e74abaa9c99937cac34f15b8eb1583065d))
- add environment validation for required API keys ([16c6e70](https://github.com/aknox-epi/unleashd-client/commit/16c6e708ca773af0b1a670be0198f15b8ec551f4))
- add GitHub Flow workflow with CI/CD pipeline ([faa9fb6](https://github.com/aknox-epi/unleashd-client/commit/faa9fb681ca9c25992501f309bb677ed0f6d8fdf))

## 0.1.1 (2025-11-10)

### Documentation

- add comprehensive README.md ([1cdd188](https://github.com/aknox-epi/unleashd-client/commit/1cdd18813862523f68c301b5b4658896f714db7a))
- update AGENTS.md with pre-commit hook information ([5a105e7](https://github.com/aknox-epi/unleashd-client/commit/5a105e7e0f089fdec2c348f301997abaa2e30bfd))

### Build System

- add changelog automation and agent workflow documentation ([778d8a5](https://github.com/aknox-epi/unleashd-client/commit/778d8a52d73246ec513c6fde27c435aec5fbf8ff))
- add commitlint with conventional commits validation ([bd0612e](https://github.com/aknox-epi/unleashd-client/commit/bd0612e74abaa9c99937cac34f15b8eb1583065d))
- add GitHub Flow workflow with CI/CD pipeline ([faa9fb6](https://github.com/aknox-epi/unleashd-client/commit/faa9fb681ca9c25992501f309bb677ed0f6d8fdf))
