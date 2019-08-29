# setup-swift
This GitHub action installs Swift, enabling you to use it directly from your workflows.
Currently Linux is the only supported platform which is enough for multiple use cases, but macOS support and Windows support would be nice to have too.

# Usage
This action isn't tagged yet, so you will need to use it from master with `adtrevor/setup-swift@master`.

Basic usage:
```yaml
steps:
- uses: actions/checkout@master
- uses: adtrevor/setup-swift@master
  with:
    swift-version: '5.0.2' # Currently, you must specify a specific Swift version (no version range)
- run: swift test # Use Swift tools
```

Workflow example for a Swift package:
```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v1
    - uses: adtrevor/setup-swift@master
      with:
        version: '5.0.2'
    - name: Build package
      run: swift build
    - name: Test package
      run: swift test
```
