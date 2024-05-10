{ pkgs, lib, config, inputs, ... }:

{
  languages.python.enable = true;
  languages.python.venv.enable = true;

  languages.javascript = {
    enable = true;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  # https://devenv.sh/packages/
  packages = [ ];

}