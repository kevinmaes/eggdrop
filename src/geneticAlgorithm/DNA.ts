export class DNA {
  /**
   * Combines DNA from two parents to create a child DNA.
   * This DNA represents the genotype of the child and is
   * agnostic to the phenotype i.e. how it will be expressed by the Individual.
   * @param parentDNA1
   * @param parentDNA2
   * @returns
   */
  static crossover(parentDNA1: DNA, parentDNA2: DNA) {
    const crossedOverGenes: DNA['genes'] = [];

    // Loop over each gene in the DNA and randomly select a parent
    // to get the gene from.
    for (let i = 0; i < parentDNA1.getLength(); i++) {
      const selectedParent = Math.random() > 0.5 ? parentDNA1 : parentDNA2;
      crossedOverGenes.push(selectedParent.getGene(i));
    }

    const childDNA = new DNA(crossedOverGenes.length);
    childDNA.replaceGenes(crossedOverGenes);
    return childDNA;
  }

  private id: string = '';
  private genes: number[];
  constructor(length: number) {
    this.genes = [];
    for (let i = 0; i < length; i++) {
      this.genes.push(Math.random());
    }
  }

  getId() {
    return this.id;
  }

  setId(id: string) {
    this.id = id;
  }

  getLength() {
    return this.genes.length;
  }

  getGenes() {
    return this.genes;
  }

  getGene(index: number) {
    return this.genes[index] ?? 0;
  }

  replaceGenes(genes: number[]) {
    this.genes = genes;
  }
}
