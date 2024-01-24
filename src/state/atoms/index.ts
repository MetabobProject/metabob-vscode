import { atom } from 'recoil'

export const hasOpenTextDocuments = atom<boolean>({
  default: false,
  key: 'Metabob:hasOpenTextDocuments'
})

export const hasWorkSpaceFolders = atom<boolean>({
  default: false,
  key: 'Metabob:hasWorkSpaceFolders'
})