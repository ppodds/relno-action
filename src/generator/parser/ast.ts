// eslint-disable-next-line no-shadow
export enum ASTNodeType {
  String = "String",
  Boolean = "Boolean",
  Macro = "Macro",
  Variable = "Variable",
}

export interface ASTNode {
  type: ASTNodeType;
}

export interface StringNode extends ASTNode {
  type: ASTNodeType.String;
  value: string;
}

export interface BooleanNode extends ASTNode {
  type: ASTNodeType.Boolean;
  value: boolean;
}

export interface MacroNode extends ASTNode {
  type: ASTNodeType.Macro;
  funName: string;
  args: ASTNode[];
}

export interface VariableNode extends ASTNode {
  type: ASTNodeType.Variable;
  name: string;
}
