<script lang="ts">
    import Scene from "../components/scene.svelte";
</script>

<main>
    <Scene />
</main>

<style>
    /* Global styles - remove default browser margins/paddings */
    :global(body) {
        margin: 0;
        padding: 0;
        overflow: hidden; /* Prevent scrollbars on the body itself */
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }

    main {
        /* Not strictly necessary if Scene.svelte handles its own full-screen dimensions,
       but good for structure. */
        width: 100%;
        height: 100%;
    }
</style>
