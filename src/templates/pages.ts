import { undent } from '../string'

export const crud = (model: string, fields: any) => ({
  list: undent`
  <template>
    <AdminPage
      title='${model}'
      :actions='[{ label: "Add ${model}", to: "/admin/${model}/add" }]'
    >
      <AdminList
        endpoint='/__nxse_admin/api/${model}'
      />
    </AdminPage>
  </template>
`,
  create: undent`
  <template>
    <AdminPage
      title='Add ${model}'
    >
      <AdminForm
        endpoint='/__nxse_admin/api/${model}'
        :fields='${JSON.stringify(fields)}'
      />
    </AdminPage>
  </template>
`,

  edit: undent`
  <template>
    <AdminPage
      title='Edit ${model}'
    >
      <AdminForm
        endpoint='/__nxse_admin/api/${model}'
        :edit='true'
        :fields='${JSON.stringify(fields)}'
      />
    </AdminPage>
  </template>
`,

  delete: undent`
  <template>
    <AdminPage
      title='Delete ${model}'
    >
      <p>Are you sure you want to delete this ${model.toLowerCase()}?</p>
    </AdminPage>
  </template>
`,
})
