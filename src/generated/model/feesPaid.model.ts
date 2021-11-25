import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "../marshal"

@Entity_()
export class FeesPaid {
  constructor(props?: Partial<FeesPaid>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  fee!: bigint

  @Column_("text", {nullable: true})
  blockProducerAddress!: string | undefined | null
}
