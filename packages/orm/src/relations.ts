// import type { IModel } from "@/types"

// /**
//  * Define belongsTo relationship
//  */
// // export const belongsTo: BelongsToDecorator = (relatedModel, relation?) => {
// //   return function decorateAsRelation(target, property: string) {
// //     const Model = target.constructor as IModel
// //     Model.boot()
// //     // Model.$addRelation(
// //     //   property,
// //     //   'belongsTo',
// //     //   relatedModel,
// //     //   Object.assign({ relatedModel }, relation)
// //     // )
// //   }
// // }

// /**
//  * Define hasOne relationship
//  */
// export const OneToOne: HasOneDecorator = (relatedModel, relation?) => {
//   return function decorateAsRelation(target, property: string) {
//     const Model = target.constructor as IModel
//     Model.boot()
//     Model.$addRelation(property, 'hasOne', relatedModel, Object.assign({ relatedModel }, relation))
//   }
// }

// /**
//  * Define hasMany relationship
//  */
// export const ForeignKey: HasManyDecorator = (relatedModel, relation?) => {
//   return function decorateAsRelation(target, property: string) {
//     const Model = target.constructor as IModel
//     Model.boot()
//     Model.$addRelation(property, 'hasMany', relatedModel, Object.assign({ relatedModel }, relation))
//   }
// }

// /**
//  * Define manyToMany relationship
//  */
// export const ManyToMany: ManyToManyDecorator = (relatedModel, relation?) => {
//   return function decorateAsRelation(target, property: string) {
//     const Model = target.constructor as IModel
//     Model.boot()
//     Model.$addRelation(
//       property,
//       'manyToMany',
//       relatedModel,
//       Object.assign({ relatedModel }, relation)
//     )
//   }
// }

// /**
//  * Define hasManyThrough relationship
//  */
// export const hasManyThrough: HasManyThroughDecorator = ([relatedModel, throughModel], relation) => {
//   return function decorateAsRelation(target, property: string) {
//     const Model = target.constructor as LucidModel
//     Model.boot()
//     Model.$addRelation(
//       property,
//       'hasManyThrough',
//       relatedModel,
//       Object.assign({ relatedModel, throughModel }, relation)
//     )
//   }
// }
