import BaseCommand from '../../base';

export default class Create extends BaseCommand {
  static description = 'create an example extension'

  static flags = {
    ...BaseCommand.flags,
  }

  async run() {
    this.log(`TODO: create`)
  }
}

/*
  TEMPLATE = <<~TEMPLATE_JS.freeze
    import { h, render } from "https://cdn.pika.dev/preact@^10.4.4";
    import htm from "https://cdn.pika.dev/htm@^3.0.4";

    const html = htm.bind(h);

    export default (root, props, state) => {

      // TODO: Render your component here...

      return () => {
        // TODO: Do any cleanup here...
      };
    }
  TEMPLATE_JS
*/