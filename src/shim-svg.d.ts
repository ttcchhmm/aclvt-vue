/**
 * A shim for importing SVG files in Vue components.
 */
declare module '*.svg' {
    import Vue, {VueConstructor} from 'vue';
    const content: VueConstructor<Vue>;
    export default content;
}