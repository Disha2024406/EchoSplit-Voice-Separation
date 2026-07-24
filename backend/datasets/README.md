# EchoSplit — Dataset configuration

Datasets are **not bundled** with the project. Place your downloaded
archives under the paths configured in each YAML in this folder, or set
absolute paths using environment variables.

## Datasets

| Dataset       | Purpose                          | Config file           |
| ------------- | -------------------------------- | --------------------- |
| LibriMix      | Speaker separation training      | `librimix.yaml`       |
| WHAM!         | Noise-robust separation training | `wham.yaml`           |
| VoxCeleb1     | Speaker identification training  | `voxceleb.yaml`       |

## Layout expected

```
/data/
├── librimix/
│   ├── wav16k/
│   └── metadata/
├── wham/
│   ├── wav/
│   └── metadata/
└── voxceleb1/
    ├── wav/
    └── veri_test.txt
```

When training locally, pass `--config backend/datasets/<file>.yaml` to
your training script and load paths through `pyyaml`.
