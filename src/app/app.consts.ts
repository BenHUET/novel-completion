// storage
export const storage_or_apiKey = 'or_apiKey';
export const storage_pads_ids = 'pads_ids';
export const storage_pad = 'pads_{id}';

// defaults
export const or_defaultModel = 'mistralai/mistral-7b-instruct:free';
export const defaultPrompts = [
  '<sys>You act as a writing assistant tool, solely completing the story by picking up exactly where it stopped.</sys>\n\nTitle : Frodo Baggins and the Great Eagles\n\nSynopsis : Dive in a parallel universe where, instead of sending Frodo to the riskiest adventure of the Third Age, Gandalf has the brilliant idea to summon Gwaihir and its friends to carry The One Ring to Mount Doom.\n\nTags : lord of the rings, fantasy, adventure, fanfic\n\nStyle : extremely descriptive, lore heavy, fictional geography intensive, slow\n\nAuthor : Tolkien\n\n---\n\nA quiet day for Frodo Baggins as he sat beneath the gnarled boughs of the Party Tree, the scent of pipe-weed and freshly turned earth mingling in the warm Shire air. Butterflies flitted over the hydrangeas Bilbo had planted decades prior, and the distant hum of mill wheels turning in Bywater Brook lulled the hills into a drowsy contentment. Frodo’s hand drifted to the parchment in his lap—a half-finished map of the Far Downs, ink smudged where a curious bumblebee had landed—when a shadow swept across the page. Not the fleeting shade of a cloud, but something vast, deliberate, and accompanied by the rustle of feathers like the unfurling of sails.\n\n<inst>Frodo looks up and see Gandalf riding one of the eagles</inst>\n\n\n',
  `<sys>You act as a writing assistant tool, solely completing the story by picking up exactly where it stopped.</sys>\n\nTitle : The Cow and the Weasel\n\nSynopsis : An unpublished Fable from Jean de la Fontaine.\n\nTags : fable, poetry, unpublished, humorous, ironical\n\nAuthor : Jean de la Fontaine\n\n---\n\nThe Cow and the Weasel\n\nA cow, serene, \n`,
];
