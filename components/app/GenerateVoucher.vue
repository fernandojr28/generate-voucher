<template>
    <div>
        <p>FORMATEAR  VOUCHER</p>
        <el-input
        type="textarea"
        :rows="10"
        placeholder="Pegar voucher de Gmail"
        v-model="voucherText">
        </el-input>
        <br>
        <br>
        <el-button type="primary" @click="onResetVoucher">Limpiar</el-button>
        <el-button type="primary" @click="onGenerateVoucher" :disabled="voucherText.length===0">Generar</el-button>
        <div class="preview">
            <el-dialog
                title="Preview"
                :show-close="false"
                :visible.sync="dialogVisible"
                width="100%"
                custom-class="dialog-voucher">
                <div>
                    <ul ref="voucherPreview" class="voucher-preview" v-if="voucherPreview.length!=0">
                        <li v-for="(item, i) in voucherPreview" :key="i">
                            <span v-if="pointer==i"><el-input @blur="pointer=-1" placeholder="--" v-model="voucherPreview[i]"></el-input></span>
                            <span  v-else @click="pointer=i">{{item}}</span>
                            <el-button @click="removeItemVoucher(i)" size="mini" type="danger" icon="el-icon-delete" circle></el-button>
                        </li>
                    </ul>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="dialogVisible = false">Cancelar</el-button>
                    <el-button type="primary" @click="onClickCopy" :disabled="voucherPreview.length===0">Copiar</el-button>
                    <el-button type="primary" @click="onClickSendWsp" :disabled="voucherPreview.length===0">Enviar a whatsapp</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            voucherText: '',
            voucherPreview: [],
            pointer: -1,
            //
            dialogVisible: false,
            removeValFrom: [
                'Credimás: xxxx-xxxx-xxxx-0478',
                'Titular: JUAREZ RODRIGUEZ JULIO FERNANDO',
                'Pagado desde: Ahorro soles 191-37199337-0-86',
                'Monto pagado al cambio: US$ 0.00',
                'Tipo de cambio: S/ 0.00',
                ':',

            ]
        }
    },
    methods: {
        onResetVoucher() {
            this.voucherText = ''
        },
        onGenerateVoucher() {
            const separadores = ['\n\n','\t','\n']
            const valuesArr = this.voucherText.split (new RegExp (separadores.join('|'),'g')).filter(x=>x)
            const filtered = valuesArr.filter((element) =>{
                return !this.removeValFrom.includes(element);
            }) // filtered contains no occurrences of removeValFrom
            this.voucherPreview = filtered
            this.dialogVisible = true
        },

        removeItemVoucher(i) {
            this.voucherPreview.splice(i, 1)
        },

        onClickCopy() {
            let html = this.$refs.voucherPreview.innerHTML
            this.copyFormatted(html)
            this.dialogVisible = false
        },

        onClickSendWsp() {
            let html = this.$refs.voucherPreview.innerHTML
        },

        copyFormatted(html) {
            
            // Create container for the HTML
            // [1]
            var container = document.createElement('div')
            container.innerHTML = html

            // Hide element
            // [2]
            container.style.position = 'fixed'
            container.style.pointerEvents = 'none'
            container.style.opacity = 0

            // Detect all style sheets of the page
            var activeSheets = Array.prototype.slice.call(document.styleSheets)
            .filter(function (sheet) {
                return !sheet.disabled
            })

            // Mount the container to the DOM to make `contentWindow` available
            // [3]
            document.body.appendChild(container)

            // Copy to clipboard
            // [4]
            window.getSelection().removeAllRanges()

            var range = document.createRange()
            range.selectNode(container)
            window.getSelection().addRange(range)

            // [5.1]
            document.execCommand('copy')

            // [5.2]
            for (var i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = true

            // [5.3]
            document.execCommand('copy')

            // [5.4]
            for (var i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = false

            // Remove the container
            // [6]
            //console.log("container", container)
            document.body.removeChild(container)
        }
    }
}
</script>
<style lang="css">
    .dialog-voucher  .el-dialog__body{
        padding: 0 20px;
    }
    .voucher-preview{
        padding: 0;
    }
    .voucher-preview li{
        cursor: pointer;
        list-style: none;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid;
        align-items: center;
        padding: 5px 0;
    }
</style>