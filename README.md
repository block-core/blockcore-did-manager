README.md
# Blockcore DID Manager

Focused app that helps you manage DID identities and issue verifiable credentials (VC).

![Screenshot](screenshot.png)

## Supported DIDs

- did:dht

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) + [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template).

## Errors

If you get this error:

``
error[E0554]: `#![feature]` may not be used on the stable release channel
   --> C:\Users\user\.cargo\registry\src\index.crates.io-6f17d22bba15001f\thiserror-1.0.50\src\lib.rs:238:50
    |
238 | #![cfg_attr(error_generic_member_access, feature(error_generic_member_access))]
    |                                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^

For more information about this error, try `rustc --explain E0554`.
error: could not compile `thiserror` (lib) due to previous error
``

You can attempt to update Rust:

`rustup default nightly`