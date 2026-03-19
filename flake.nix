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
          nodejs_24 = pkgs.nodejs_24;
        };
        devShell = pkgs.mkShell {
          buildInputs = with self.packages.${system}; [
            nodejs_24
          ];
        };
      });
}
