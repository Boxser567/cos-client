const _config = {
  AppId: '1253834952',
  SecretId: 'AKIDa4NkxzaV0Ut7Yr4sa6ScbNwMdibHb4A4',
  SecretKey: 'qUwCGAsRq46wZ1HLCrKbhfS8e0A8tUu8'
}

export const userConfig = state => new (require('cos-util'))(_config)
