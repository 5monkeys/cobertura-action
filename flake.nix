{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    flakeUtils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flakeUtils }:
    flakeUtils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages = flakeUtils.lib.flattenTree {
          nodejs_20 = pkgs.nodejs_20;
        };
        devShell = pkgs.mkShell {
          buildInputs = with self.packages.${system}; [
            nodejs_20
          ];
        };
      });
}
